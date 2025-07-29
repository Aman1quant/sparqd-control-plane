import { createAccount } from '@/domains/account/account.service';
import { createAccountMember, CreateAccountMemberData } from '@/domains/account/accountMember.service';
import { createUser, CreateUserData } from '@/domains/user/user.service';

// export async function createDefaultWorkspace(userId: string): Promise<string> {
//   console.log(`Creating default workspace for user ${userId}`);
//   // Simulate DB write or API call
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   return `workspace-${userId}`;
// }

// export async function sendWelcomeEmail(userId: string): Promise<void> {
//   console.log(`Sending welcome email to user ${userId}`);
// }

export async function createUserActivity(input: { email: string; kcSub: string; fullName: string; avatarUrl?: string }) {
  const user = await createUser(input);

  return {
    // id: user.id, // bigint cause non-serializable from prisma
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    kcSub: user.kcSub,
  };
}

export async function createAccountActivity(input: { name: string }) {
  const account = await createAccount({ name: input.name });
  return {
    id: account.id,
    name: account.name,
  };
}

export async function createAccountMemberActivity(input: CreateAccountMemberData) {
  const member = await createAccountMember(input);
  return {
    id: member.id,
    roleId: member.roleId,
    accountId: member.accountId,
    userId: member.userId,
  };
}
