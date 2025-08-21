import { Prisma } from '@prisma/client';
import { createdByUserSelect } from '../user/user.select';

export const workspaceSelect = Prisma.validator<Prisma.WorkspaceSelect>()({
  id: false,
  uid: true,
  name: true,
  description: true,
  storage: {
    select: {
      uid: true,
      storageName: true,
      storageConfig: true,
      createdAt: true,
    }
  },
  network: {
    select: {
      uid: true,
      networkName: true,
      networkConfig: true,
      createdAt: true,
    }
  },
  createdAt: true,
  createdBy: {
    select: createdByUserSelect,
  },
  updatedAt: true,
});
