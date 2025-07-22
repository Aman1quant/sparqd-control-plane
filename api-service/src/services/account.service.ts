import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { PrismaClient, Account, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function listAccount({ name, page = 1, limit = 10 }: { name?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Account>> {
  const whereClause = {
    name: {
      contains: name,
      mode: 'insensitive' as const,
    },
  };

  const [totalData, accounts] = await Promise.all([
    prisma.account.count({ where: whereClause }),

    prisma.account.findMany({
      where: whereClause,
      skip: offsetPagination(page, limit),
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: accounts,
    pagination: {
      currentPage: page,
      totalPages,
      totalData,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function detailAccount(uid: string): Promise<Account | null> {
  const account = await prisma.account.findUnique({
    where: { uid },
  });

  if (!account) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }

  return account;
}

export async function createAccount(data: { name: string }): Promise<Account> {
  const account = await prisma.account.create({
    data,
  });

  if (!account) {
    throw {
      status: 500,
      message: 'Failed to create account',
    };
  }
  return account;
}

export async function createAccountTx(tx: Prisma.TransactionClient, data: { name: string }): Promise<Account> {
  const account = await tx.account.create({
    data,
  });

  if (!account) {
    throw {
      status: 500,
      message: 'Failed to create account',
    };
  }
  return account;
}

export async function editAccount(uid: string, data: { name: string }): Promise<Account> {
  const account = await prisma.account.update({
    where: { uid },
    data,
  });

  if (!account) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }

  return account;
}

export async function deleteAccount(uid: string): Promise<Account> {
  const account = await prisma.account.delete({
    where: { uid },
  });

  if (!account) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }
  return account;
}
