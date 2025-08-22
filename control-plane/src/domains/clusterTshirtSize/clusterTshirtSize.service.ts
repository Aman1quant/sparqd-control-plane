import { PrismaClient } from '@prisma/client';

import logger from '@/config/logger';
import { offsetPagination } from '@/utils/api';

import { regionSelect } from '../region/region.select';
import { ClusterTshirtSizeFilters, ClusterTshirtSizeList } from './clusterTshirtSize.type';

const prisma = new PrismaClient();

export async function listClusterTshirtSize({
  provider,
  name,
  plan,
  description,
  createdById,
  page = 1,
  limit = 10,
}: ClusterTshirtSizeFilters): Promise<ClusterTshirtSizeList> {
  const whereClause: Record<string, unknown> = {};
  logger.debug({ provider, plan }, 'Provider and plan');
  if (plan === 'free') {
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
      select: {
        uid: true,
        name: true,
        nodeInstanceTypes: true,
        isActive: true,
        isFreeTier: true,
        region: {
          select: regionSelect,
        },
      },
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
