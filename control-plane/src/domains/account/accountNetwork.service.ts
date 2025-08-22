import { Prisma, PrismaClient } from '@prisma/client';

import { offsetPagination } from '@/utils/api';

import { AccountNetworkFilters } from './accountNetwork.type';
import { createdByUserSelect } from '../user/user.select';

const prisma = new PrismaClient();

export async function createAccountNetworkTx(tx: Prisma.TransactionClient, input: Prisma.AccountNetworkCreateInput) {
  return tx.accountNetwork.create({
    data: {
      account: input.account,
      providerName: input.providerName,
      createdBy: input.createdBy,
      networkName: input.networkName,
      networkConfig: input.networkConfig,
    },
    include: {
      account: true,
    },
  });
}

export async function listAccountNetworks({ userId, accountUid, networkName, page = 1, limit = 10 }: AccountNetworkFilters) {
  const whereClause: Record<string, unknown> = {};

  // IMPORTANT: Mandatory filter by userId
  whereClause.account = {
    uid: accountUid,
    members: { some: { userId } },
  };
  if (networkName) {
    whereClause.networkName = {
      contains: networkName,
      mode: 'insensitive' as const,
    };
  }

  const [totalData, accountNetworks] = await Promise.all([
    prisma.accountNetwork.count({ where: whereClause }),
    prisma.accountNetwork.findMany({
      where: whereClause,
      select: {
        uid: true,
        account: {
          select: { uid: true },
        },
        networkName: true,
        networkConfig: true,
        createdAt: true,
        createdBy: {select: createdByUserSelect}
      },
      skip: offsetPagination(page, limit),
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: accountNetworks,
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
