import { PrismaClient } from '@prisma/client';

import { HttpError } from '@/types/errors';
import { offsetPagination } from '@/utils/api';

import { detailRegionSelect } from './region.select';
import { CloudRegion, CloudRegionList, RegionFilters } from './region.type';

const prisma = new PrismaClient();

export async function listCloudRegion({ name, page = 1, limit = 10 }: RegionFilters): Promise<CloudRegionList> {
  const whereClause: Record<string, unknown> = {};
  if (name) {
    whereClause.name = {
      contains: name,
      mode: 'insensitive' as const,
    };
  }

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

export async function getCloudRegion(uid: string): Promise<CloudRegion> {
  const region = await prisma.region.findUnique({
    where: { uid },
    select: detailRegionSelect,
  });
  if (!region) {
    throw new HttpError(404, 'Region not found');
  }
  return region;
}
