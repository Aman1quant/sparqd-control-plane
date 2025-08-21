import { PrismaClient } from '@prisma/client';

import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

import { availableServicesSelect } from './service.select';
import { AvailableServices, ServiceFilters } from './service.type';

const prisma = new PrismaClient();

/******************************************************************************
 * Get Available Services
 *****************************************************************************/
export async function getAvailableServices({ page = 1, limit = 10, plan }: ServiceFilters): Promise<PaginatedResponse<AvailableServices>> {
  const whereClause: Record<string, unknown> = {};

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
