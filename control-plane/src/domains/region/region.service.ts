import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse, offsetPagination } from '@/utils/api';
import { DetailRegion, detailRegionSelect, RegionFilters } from './region.type';
import { PaginatedResponse } from '@/models/api/base-response';

const prisma = new PrismaClient();

export async function listCloudRegion({ page = 1, limit = 10 }: RegionFilters): Promise<PaginatedResponse<DetailRegion>> {
  const whereClause: Record<string, unknown> = {};

  const [totalData, regions] = await Promise.all([
    prisma.region.count({ where: whereClause }),
    prisma.region.findMany({
      where: whereClause,
      // orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      select: detailRegionSelect,
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: regions,
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
