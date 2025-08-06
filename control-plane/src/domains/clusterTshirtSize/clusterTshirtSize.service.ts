import { Prisma, PrismaClient } from '@prisma/client';

import logger from '@/config/logger';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

const prisma = new PrismaClient();

export interface ClusterTshirtSizeFilters {
  provider?: string;
  name?: string;
  plan?: string;
  description?: string;
  createdById?: bigint;
  page?: number;
  limit?: number;
}

export const detailClusterTshirtSizeSelect = Prisma.validator<Prisma.ClusterTshirtSizeSelect>()({
  uid: true,
  provider: true,
  name: true,
  nodeInstanceTypes: true,
  isActive: true,
  isFreeTier: true,
});

type DetailClusterTshirtSize = Prisma.ClusterTshirtSizeGetPayload<{
  select: typeof detailClusterTshirtSizeSelect;
}>;

export async function listClusterTshirtSize({
  provider,
  name,
  plan,
  description,
  createdById,
  page = 1,
  limit = 10,
}: ClusterTshirtSizeFilters): Promise<PaginatedResponse<DetailClusterTshirtSize | null>> {
  const whereClause: Record<string, unknown> = {};
  logger.debug({ provider, plan }, 'Provider and plan');
  if (plan === 'FREE') {
    whereClause.isFreeTier = true;
  }

  if (provider) {
    whereClause.provider = provider;
  }

  if (name) {
    whereClause.name = {
      contains: name,
      mode: 'insensitive' as const,
    };
  }

  if (description) {
    whereClause.description = {
      contains: description,
      mode: 'insensitive' as const,
    };
  }

  if (createdById) {
    whereClause.createdById = createdById;
  }

  whereClause.isActive = true;

  const [totalData, clusters] = await Promise.all([
    prisma.clusterTshirtSize.count({ where: whereClause }),
    prisma.clusterTshirtSize.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      select: detailClusterTshirtSizeSelect,
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: clusters,
    pagination: {
      totalData,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
