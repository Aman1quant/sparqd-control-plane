import { Prisma } from '@prisma/client';
import { detailRegionSelect } from './region.select';

export interface RegionFilters {
  name?: string;
  page?: number;
  limit?: number;
}

export type DetailRegion = Prisma.RegionGetPayload<{
  select: typeof detailRegionSelect;
}>;
