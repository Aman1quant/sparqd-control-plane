import * as AccountBillingService from '@domains/account/accountBilling.service';
import * as AccountMemberService from '@domains/account/accountMember.service';
import * as AccountNetworkService from '@domains/account/accountNetwork.service';
import * as AccountStorageService from '@domains/account/accountStorage.service';
import { getRoleByName } from '@domains/permission/role.service';
import * as UserService from '@domains/user/user.service';
import { Prisma, PrismaClient } from '@prisma/client';

import config from '@/config/config';
import { HttpError } from '@/types/errors';

import { AccountNetworkConfig, accountNetworkConfigSchema, AccountStorageBackendConfig, accountStorageBackendConfigSchema } from '../account/account.type';
import { createWorkspaceMemberTx } from '../workspace/workspaceMember.service';
import { OnboardNewUserInput } from './onboarding.type';

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
        cloudProvider: { name: 'aws' },
        name: 'ap-southeast-1',
      },
    });

    if (!region) {
      throw new HttpError(404, 'Region not found');
    }

    // Create account
    const account = await tx.account.create({
      data: {
        name: 'default',
        region: { connect: { id: region.id } },
        createdBy: {
          connect: { id: user.id },
        },
        plan: 'free',
      },
      include: {
        region: {
          include: { cloudProvider: true },
        },
      },
    });

    if (!account) {
      throw new HttpError(400, 'Failed to create account');
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
      vpcId: config.provisioningFreeTierAWS.vpcId,
      securityGroupIds: config.provisioningFreeTierAWS.securityGroupIds,
      subnetIds: config.provisioningFreeTierAWS.subnetIds,
    };

    // Validate account network config
    const networkConfigParsed = accountNetworkConfigSchema.safeParse(networkConfig);
    if (!networkConfigParsed.success) {
      throw new HttpError(400, 'Invalid networkConfig', networkConfigParsed.error.format());
    }

    // Create account network
    const accountNetwork = await AccountNetworkService.createAccountNetworkTx(tx, {
      account: { connect: { id: account.id } },
      providerName: 'aws',
      networkName: 'default',
      networkConfig: networkConfig as unknown as Prisma.InputJsonValue,
      createdBy: { connect: { id: user.id } },
    });

    // Create account storage config
    const backendConfig: AccountStorageBackendConfig = {
      type: 's3',
      bucket: config.provisioningFreeTierAWS.s3Bucket,
      key: `${account.uid}/tofuState`,
      region: config.provisioningFreeTierAWS.defaultRegion,
    };

    // Validate account storage config
    const backendConfigParsed = accountStorageBackendConfigSchema.safeParse(backendConfig);
    if (!backendConfigParsed.success) {
      throw new HttpError(400, 'Invalid backendConfig', backendConfigParsed.error.format());
    }

    // Create account storage
    const accountStorage = await AccountStorageService.createAccountStorageTx(tx, {
      account: { connect: { id: account.id } },
      storageName: 'default',
      providerName: 'aws',
      type: 's3',
      root: `s3://${config.provisioningFreeTierAWS.s3Bucket}/${account.uid}`,
      dataPath: '/data',
      workspacePath: '/workspace',
      backendConfig: backendConfig as unknown as Prisma.InputJsonValue,
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
        networkId: accountNetwork.id,
      },
    });

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
