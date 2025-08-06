import { Prisma } from '@prisma/client';

export const detailAccountSelect = Prisma.validator<Prisma.AccountSelect>()({
  id: false,
  uid: true,
  name: true,
  plan: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  storage: {
    select: {
      uid: true,
      providerName: true,
      storageName: true,
    },
  },
  network: {
    select: {
      uid: true,
      providerName: true,
      networkName: true,
    },
  },
});
