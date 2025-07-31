import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { PrismaClient, Account, Prisma, RealmStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const detailAccountSelect = Prisma.validator<Prisma.AccountSelect>()({
  id: false,
  uid: true,
  name: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
});

type DetailAccount = Prisma.AccountGetPayload<{
  select: typeof detailAccountSelect;
}>;

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



/******************************************************************************
 * Describe an account
 *****************************************************************************/
export async function detailAccount(uid: string): Promise<DetailAccount | null> {
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

/******************************************************************************
 * Update an account
 *****************************************************************************/
export interface UpdateAccountData {
  name?: string;
  kcRealmStatus?: RealmStatus;
}

export async function editAccount(uid: string, data: UpdateAccountData): Promise<Account> {
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
