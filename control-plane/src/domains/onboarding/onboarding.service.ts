import * as AccountBillingService from '@domains/account/accountBilling.service';
import * as AccountMemberService from '@domains/account/accountMember.service';
import * as AccountNetworkService from '@domains/account/accountNetwork.service';
import * as AccountStorageService from '@domains/account/accountStorage.service';
import { getRoleByName } from '@domains/permission/role.service';
import * as UserService from '@domains/user/user.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { createWorkspaceTx } from '../workspace/workspace.service';
import { createWorkspaceMemberTx } from '../workspace/workspaceMember.service';
import { OnboardNewUserInput } from './onboarding.type';
import { AccountNetworkConfig, accountNetworkConfigSchema, AccountStorageConfig, accountStorageConfigSchema } from '../account/account.type';
import config from '@/config/config';
// import * as AuditService from './audit.service';

const prisma = new PrismaClient();

export async function onboardNewUser(input: OnboardNewUserInput) {

  // DB transaction — user/account creation
  const user = await prisma.$transaction(async (tx) => {
    const user = await UserService.createUserTx(tx, {
      email: input.email,
      kcSub: input.kcSub,
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
    });

    // Define region
    const region = await prisma.region.findUnique({
      where: {
        name_cloudProviderId: {
          cloudProviderId: 1,
          name: 'ap-southeast-1',
        },
      },
    });

    if (!region) {
      throw {
        status: 404,
        message: 'Region not found',
      };
    }

    // Create account
    const account = await tx.account.create({
      data: {
        name: 'default',
        region: {
          connect: { uid: '' }
        },
        createdBy: {
          connect: { id: user.id }
        },
        plan: 'FREE'
      },
      include: {
        region: {
          include: { cloudProvider: true }
        },
      }
    });

    if (!account) {
      throw {
        status: 500,
        message: 'Failed to create account',
      };
    }

    // Assign account membership & role as Owner
    const accountOwnerRole = await getRoleByName('AccountOwner');
    await AccountMemberService.createAccountMemberTx(tx, {
      userId: user.id,
      accountId: account.id,
      roleId: accountOwnerRole?.id || -1,
    });

    // Create account billing
    await AccountBillingService.createAccountBillingTx(tx, {
      accountId: account.id,
      billingEmail: user.email,
    });

    // Create account network config
    const networkConfig: AccountNetworkConfig = {
      name: 'default',
      providerName: 'AWS',
      config: {
        vpcId: config.provisioningFreeTierAWS.vpcId,
        securityGroupIds: config.provisioningFreeTierAWS.securityGroupIds,
        subnetIds: config.provisioningFreeTierAWS.subnetIds,
      },
    };

    // Validate account network config
    const networkConfigParsed = accountNetworkConfigSchema.safeParse(networkConfig);
    if (!networkConfigParsed.success) {
      throw {
        status: 400,
        message: 'Invalid networkConfig',
        issues: networkConfigParsed.error.format(),
      };
    }

    // Create account network
    const accountNetwork = await AccountNetworkService.createAccountNetworkTx(tx, {
      account: { connect: { id: account.id } },
      networkName: 'default',
      networkConfig: networkConfig as unknown as Prisma.InputJsonValue,
      createdBy: { connect: { id: user.id } },
    });

    // Create account storage config
    const storageConfig: AccountStorageConfig = {
      name: 'default',
      providerName: 'AWS',
      dataPath: `s3://${config.provisioningFreeTierAWS.s3Bucket}/${account.uid}/data`,
      tofuBackend: {
        type: 's3',
        bucket: config.provisioningFreeTierAWS.s3Bucket,
        key: `${account.uid}/tofuState`,
        region: config.provisioningFreeTierAWS.defaultRegion,

      }
    }

    // Validate account storage config
    const storageConfigParsed = accountStorageConfigSchema.safeParse(storageConfig);
    if (!storageConfigParsed.success) {
      throw {
        status: 400,
        message: 'Invalid storageConfig',
        issues: storageConfigParsed.error.format(),
      };
    }

    // Create account storage
    const accountStorage = await AccountStorageService.createAccountStorageTx(tx, {
      account: { connect: { id: account.id } },
      storageName: 'default',
      storageConfig: storageConfig as unknown as Prisma.InputJsonValue,
      createdBy: { connect: { id: user.id } },
    });

    // Create workspace
    const workspace = await createWorkspaceTx(tx, {
      account: { connect: { id: account.id } },
      name: 'default',
      description: 'default',
      storage: { connect: { id: accountStorage.id } },
      network: { connect: { id: accountNetwork.id } },
      metadata: {},
      createdBy: { connect: { id: user.id } },
    });

    // Assign as workspace owner
    const workspaceOwnerRole = await getRoleByName('WorkspaceOwner');
    await createWorkspaceMemberTx(tx, {
      workspaceId: workspace.id,
      userId: user.id,
      roleId: workspaceOwnerRole?.id || -1,
    });

    // // TODO
    // // await AuditService.logAuditTx(tx, [
    // //   {
    // //     userId: user.id,
    // //     accountId: account.id,
    // //     action: 'USER_ACCOUNT_INITIALIZED',
    // //   },
    // // ]);

    return {
      user,
      account,
    };
  });

  // Step 2: Provision new realm
  // await provisionNewRealm(user.account.uid);

  // Step 3: Mark account kcRealmStatus as FINALIZED
  // await AccountService.editAccount(user.account.uid, { kcRealmStatus: 'FINALIZED' });

  const finalUser = await UserService.getUserByKcSub(user.user.kcSub);

  return finalUser;
}
