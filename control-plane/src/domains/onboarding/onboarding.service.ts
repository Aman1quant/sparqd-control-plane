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
import { HttpError } from '@/types/errors';
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
    const region = await prisma.region.findFirst({
      where: {
        cloudProvider: { name: 'AWS' },
        name: 'ap-southeast-1',
      },
    });

    if (!region) { throw new HttpError(404, 'Region not found') }

    // Create account
    const account = await tx.account.create({
      data: {
        name: 'default',
        region: { connect: { id: region.id } },
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

    if (!account) { throw new HttpError(400, 'Failed to create account') }

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
      throw new HttpError(400,
        'Invalid networkConfig',
        networkConfigParsed.error.format()
      )
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
      throw new HttpError(400,
        'Invalid storageConfig',
        storageConfigParsed.error.format()
      )
    }

    // Create account storage
    const accountStorage = await AccountStorageService.createAccountStorageTx(tx, {
      account: { connect: { id: account.id } },
      storageName: 'default',
      storageConfig: storageConfig as unknown as Prisma.InputJsonValue,
      createdBy: { connect: { id: user.id } },
    });

    // Create workspace
    const workspace = await tx.workspace.create({
      data: {
        name: 'Default Workspace',
        description: 'Default Workspace',
        createdById: user.id,
        accountId: account.id,
        storageId: accountStorage.id,
        networkId: accountNetwork.id
      }
    })

    // Assign as workspace owner
    const workspaceOwnerRole = await getRoleByName('WorkspaceOwner');
    await createWorkspaceMemberTx(tx, {
      workspaceId: workspace.id,
      userId: user.id,
      roleId: workspaceOwnerRole?.id || -1,
    });

    return {
      user,
      account,
    };
  });

  const finalUser = await UserService.getUserByKcSub(user.user.kcSub);

  return finalUser;
}
