import { Account, AccountPlan, Prisma, PrismaClient, RealmStatus } from '@prisma/client';

import config from '@/config/config';
import logger from '@/config/logger';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

import { detailAccountSelect } from './account.select';
import { AccountFilters, DetailAccount } from './account.type';

const prisma = new PrismaClient();

/******************************************************************************
 * List available accounts
 *****************************************************************************/
export async function listAccount({ userId, name, page = 1, limit = 10 }: AccountFilters): Promise<PaginatedResponse<DetailAccount>> {
  const whereClause: Record<string, unknown> = {};

  // IMPORTANT: Mandatory filter by userId
  whereClause.members = {
    some: {
      userId,
    },
  };

  // OPTIONALS
  if (name) {
    whereClause.name = {
      contains: name,
      mode: 'insensitive' as const,
    };
  }

  logger.debug({ userId }, 'Listing accounts for a user');

  const [totalData, accounts] = await Promise.all([
    prisma.account.count({ where: whereClause }),
    prisma.account.findMany({
      where: whereClause,
      select: detailAccountSelect,
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
 * Get an account
 *****************************************************************************/
export async function detailAccount(uid: string): Promise<DetailAccount | null> {
  const account = await prisma.account.findUnique({
    where: { uid },
    select: detailAccountSelect,
  });

  if (!account) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }

  return account;
}

export async function createAccount(data: { name: string; plan?: AccountPlan }): Promise<Account> {
  const systemUser = await prisma.user.findUnique({ where: { email: config.systemUserEmail } });
  if (!systemUser) {
    throw {
      status: 500,
      message: 'Failed to create account',
    };
  }

  const account = await prisma.account.create({
    data: { ...data, createdById: systemUser.id },
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
  const systemUser = await tx.user.findUnique({ where: { email: config.systemUserEmail } });
  if (!systemUser) {
    throw {
      status: 500,
      message: 'Failed to create account',
    };
  }

  const account = await tx.account.create({
    data: { ...data, createdById: systemUser.id },
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

export async function getAccountPlan(uid: string): Promise<string> {
  const account = await prisma.account.findUnique({ where: { uid } });
  if (!account) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }
  return account.plan;
}
