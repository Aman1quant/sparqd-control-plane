import { Prisma } from '@prisma/client';

export const accountSelect = Prisma.validator<Prisma.AccountSelect>()({
  uid: true,
  name: true,
  region: {
    include: {
      cloudProvider: true,
    },
  },
  plan: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  storage: {
    select: {
      uid: true,
      storageName: true,
    },
  },
  network: {
    select: {
      uid: true,
      networkName: true,
    },
  },
});
