import * as AccountService from '@domains/account/account.service';
import { getRoleByName } from '@domains/permission/role.service';
import * as UserService from '@domains/user/user.service';
import { PrismaClient } from '@prisma/client';

import { createWorkspaceTx } from '../workspace/workspace.service';
import { createWorkspaceMemberTx } from '../workspace/workspaceMember.service';
import { OnboardNewUserInput } from './onboarding.type';
// import * as AuditService from './audit.service';

const prisma = new PrismaClient();

export async function onboardNewUser(input: OnboardNewUserInput) {
  // Step 1: DB transaction — user/account creation
  const user = await prisma.$transaction(async (tx) => {
    const user = await UserService.createUserTx(tx, {
      email: input.email,
      kcSub: input.kcSub,
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
    });

    const region = await prisma.region.findUnique({
      where: {
        name_cloudProviderId: {
          cloudProviderId: 1,
          name: "ap-southeast-1",
        },
      }
    })
    if (!region) {
      throw {
        status: 404,
        message: 'Region not found',
      };
    }

    const account = await AccountService.createAccountTx(tx, {
      name: 'default',
      region,
      user,
      networkConfig: {
        name: 'default',
        providerName: 'AWS',
        config: {
          vpcId: 'toBeReplaced',
          securityGroupIds: ['toBeReplaced'],
          subnetIds: ['toBeReplaced'],
        },
      },
      storageConfig: {
        name: 'default',
        providerName: 'AWS',
        dataPath: 'toBeReplaced',
        tofuBackend: {
          type: 's3',
          bucket: 'toBeReplaced',
          key: 'toBeReplaced',
          region: 'toBeReplaced',
        },
      },
      isDefault: true,
    });

    const workspace = await createWorkspaceTx(tx, {
      account: { connect: { id: account.account.id } },
      name: 'default',
      description: 'default',
      storage: { connect: { id: account.accountStorage.id } },
      network: { connect: { id: account.accountNetwork.id } },
      metadata: {},
      createdBy: { connect: { id: user.id } },
    });

    const workspaceOwnerRole = await getRoleByName('WorkspaceOwner');
    await createWorkspaceMemberTx(tx, {
      workspaceId: workspace.id,
      userId: user.id,
      roleId: workspaceOwnerRole?.id || -1,
    });

    // TODO
    // await AuditService.logAuditTx(tx, [
    //   {
    //     userId: user.id,
    //     accountId: account.id,
    //     action: 'USER_ACCOUNT_INITIALIZED',
    //   },
    // ]);

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
