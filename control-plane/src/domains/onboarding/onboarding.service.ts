import { PrismaClient } from '@prisma/client';
import * as UserService from '@domains/user/user.service';
import * as AccountService from '@domains/account/account.service';
import * as AccountMemberService from '@domains/account/accountMember.service';
// import { provisionNewRealm } from '@domains/authentication/keycloakAdmin.service';
import { createAccountBillingTx } from '../account/accountBilling.service';
import { createWorkspaceTx } from '../workspace/workspace.service';
import { createWorkspaceMemberTx } from '../workspace/workspaceMember.service';
import { getRoleByName } from '@domains/permission/role.service';
import { createAccountNetworkTx } from '../account/accountNetwork.service';
import { createAccountStorageTx } from '../account/accountStorage.service';
// import * as AuditService from './audit.service';

const prisma = new PrismaClient();

export type OnboardNewUserInput = {
  email: string;
  kcSub: string;
  fullName?: string;
  avatarUrl?: string;
  accountName: string;
};

export async function onboardNewUser(input: OnboardNewUserInput) {
  // Step 1: DB transaction — user/account creation
  const user = await prisma.$transaction(async (tx) => {
    const user = await UserService.createUserTx(tx, {
      email: input.email,
      kcSub: input.kcSub,
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
    });

    const account = await AccountService.createAccountTx(tx, { name: input.accountName });

    const accountOwnerRole = await getRoleByName('AccountOwner');
    const accountMembership = await AccountMemberService.createAccountMemberTx(tx, {
      userId: user.id,
      accountId: account.id,
      roleId: accountOwnerRole?.id || -1,
    });

    const accountBilling = await createAccountBillingTx(tx, { accountId: account.id, billingEmail: user.email });

    const accountNetwork = await createAccountNetworkTx(tx, {
      account: { connect: { id: account.id } },
      providerName: 'AWS',
      networkName: 'default',
    })

    const accountStorage = await createAccountStorageTx(tx, {
      account: { connect: { id: account.id } },
      providerName: 'AWS',
      storageName: 'default',
    })

    const workspace = await createWorkspaceTx(tx, {
      account: { connect: { id: account.id } },
      name: 'default',
      description: 'default',
      storage: { connect: { id: accountStorage.id } },
      network: { connect: { id: accountNetwork.id } },
      metadata: {},
      createdBy: { connect: { id: user.id } }
    });

    const workspaceOwnerRole = await getRoleByName('WorkspaceOwner');
    const workspaceMembership = await createWorkspaceMemberTx(tx, {
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
      user: {
        ...user,
        accounts: [accountMembership, accountBilling, workspace, workspaceMembership],
      },
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
