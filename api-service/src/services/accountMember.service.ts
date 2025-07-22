// import { PaginatedResponse } from '@/models/api/base-response';
// import { offsetPagination } from '@/utils/api';
import { Prisma, PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

type CreateAccountMemberData = {
  userId: bigint;
  accountId: bigint;
  roleId: number;
};

export async function createAccountMemberTx(tx: Prisma.TransactionClient, input: CreateAccountMemberData) {
  return tx.accountMember.create({
    data: {
      userId: input.userId,
      accountId: input.accountId,
      roleId: input.roleId,
    },
    include: {
      account: true,
      role: true,
    },
  });
}
