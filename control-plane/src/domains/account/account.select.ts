import { Prisma } from '@prisma/client';

import { createdByUserSelect } from '../user/user.select';

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
  createdBy: { select: createdByUserSelect },
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
