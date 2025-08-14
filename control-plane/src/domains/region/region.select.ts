import { Prisma } from '@prisma/client';

export const cloudProviderSelect = Prisma.validator<Prisma.CloudProviderSelect>()({
  id: false,
  uid: true,
  name: true,
  displayName: true,
});

export const regionSelect = Prisma.validator<Prisma.RegionSelect>()({
  id: false,
  uid: true,
  name: true,
  displayName: true,
  cloudProvider: {
    select: cloudProviderSelect,
  },
});
