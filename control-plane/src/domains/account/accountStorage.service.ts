import { Prisma, PrismaClient } from '@prisma/client';

import { offsetPagination } from '@/utils/api';

import { createdByUserSelect } from '../user/user.select';
import { AccountStorageFilters } from './accountStorage.type';

const prisma = new PrismaClient();

export async function createAccountStorageTx(tx: Prisma.TransactionClient, input: Prisma.AccountStorageCreateInput) {
  return tx.accountStorage.create({
    data: input,
    include: {
      account: true,
    },
  });
}

export async function listAccountStorages({ userId, accountUid, storageName, page = 1, limit = 10 }: AccountStorageFilters) {
  const whereClause: Record<string, unknown> = {};

  // IMPORTANT: Mandatory filter by userId
  whereClause.account = {
    uid: accountUid,
    members: { some: { userId } },
  };
  if (storageName) {
    whereClause.storageName = {
      contains: storageName,
      mode: 'insensitive' as const,
    };
  }

  const [totalData, accountStorages] = await Promise.all([
    prisma.accountStorage.count({ where: whereClause }),
    prisma.accountStorage.findMany({
      where: whereClause,
      select: {
        uid: true,
        account: {
          select: { uid: true },
        },
        providerName: true,
        type: true,
        storageName: true,
        root: true,
        dataPath: true,
        workspacePath: true,
        backendConfig: true,
        createdAt: true,
        createdBy: {
          select: createdByUserSelect,
        },
      },
      skip: offsetPagination(page, limit),
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: accountStorages,
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
