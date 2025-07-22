import { PrismaClient } from '@prisma/client';
import * as UserService from '@services/user.service';
import * as AccountService from '@services/account.service';
import * as AccountMemberService from '@services/accountMember.service';
import { provisionNewRealm } from '@services/keycloakAdmin.service';
// import * as AuditService from './audit.service';

const prisma = new PrismaClient();

type OnboardNewUserInput = {
  email: string;
  kcSub: string;
  fullName?: string;
  avatarUrl?: string;
  accountName: string;
  roleId: number;
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

    const member = await AccountMemberService.createAccountMemberTx(tx, {
      userId: user.id,
      accountId: account.id,
      roleId: input.roleId,
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
        accounts: [member],
      },
      account,
    };
  });

  // Step 2: Provision new realm
  await provisionNewRealm(user.account.uid, user.user.email);

  // Step 3: Mark account kcRealmStatus as FINALIZED
  await AccountService.editAccount(user.account.uid, {kcRealmStatus: 'FINALIZED'})

  const finalUser = await UserService.getUserByKcSub(user.user.kcSub)

  return finalUser;
}
