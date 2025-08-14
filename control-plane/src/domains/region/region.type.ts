import { Prisma } from '@prisma/client';

export interface RegionFilters {
  name?: string;
  page?: number;
  limit?: number;
}

export const detailRegionSelect = Prisma.validator<Prisma.RegionSelect>()({
  id: false,
  uid: true,
  name: true,
  displayName: true,
  cloudProvider: {
    select: {
      uid: true,
      name: true,
      displayName: true,
    },
  },
});

export type DetailRegion = Prisma.RegionGetPayload<{
  select: typeof detailRegionSelect;
}>;
