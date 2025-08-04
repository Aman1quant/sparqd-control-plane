import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ServiceFilters {
  page?: number;
  limit?: number;
}

/******************************************************************************
 * Get Available Services
 *****************************************************************************/
export const availableServicesSelect = Prisma.validator<Prisma.ServiceSelect>()({
  id: false,
  uid: true,
  name: true,
  displayName: true,
  description: true,
  isActive: true,
  isFreeTier: true,
  createdAt: true,
  updatedAt: true,
  versions: {
    select: {
      id: false,
      uid: true,
      version: true,
      releaseDate: true,
      isActive: true,
      isDefault: true,
      changelog: true,
      createdAt: true,
    },
  },
});

type AvailableServices = Prisma.ServiceGetPayload<{
  select: typeof availableServicesSelect;
}>;

export async function getAvailableServices({ page = 1, limit = 10 }: ServiceFilters): Promise<PaginatedResponse<AvailableServices>> {
  const whereClause: Record<string, unknown> = {};
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
