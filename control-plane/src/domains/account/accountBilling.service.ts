// import { PaginatedResponse } from '@/models/api/base-response';
// import { offsetPagination } from '@/utils/api';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type CreateAccountBillingData = {
  accountId: bigint;
  billingEmail: string;
};

export async function createAccountBillingTx(tx: Prisma.TransactionClient, input: CreateAccountBillingData) {
  return tx.accountBilling.create({
    data: {
      accountId: input.accountId,
      billingEmail: input.billingEmail,
    },
    include: {
      account: true,
    },
  });
}

export async function createAccountBilling(input: CreateAccountBillingData) {
  return prisma.accountBilling.create({
    data: {
      accountId: input.accountId,
      billingEmail: input.billingEmail,
    },
    include: {
      account: true,
    },
  });
}
