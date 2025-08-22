import { PrismaClient } from '@prisma/client';

import { offsetPagination } from '@/utils/api';

import { availableServicesSelect } from './service.select';
import { AvailableServiceList, ServiceFilters } from './service.type';

const prisma = new PrismaClient();

/******************************************************************************
 * List Available Services
 *****************************************************************************/
export async function listAvailableService({ name, page = 1, limit = 10, plan }: ServiceFilters): Promise<AvailableServiceList> {
  const whereClause: Record<string, unknown> = {};

  if (name) {
    whereClause.name = {
      contains: name,
      mode: 'insensitive' as const,
    };
  }

  if (plan === 'free') {
    whereClause.isFreeTier = true;
  }

  const [totalData, availableServices] = await Promise.all([
    prisma.service.count({ where: whereClause }),
    prisma.service.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      select: availableServicesSelect,
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: availableServices,
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
