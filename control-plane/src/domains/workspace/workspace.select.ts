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
      providerName: true,
      type: true,
      root: true,
      dataPath: true,
      workspacePath: true,
      backendConfig: true,
      createdAt: true,
      createdBy: { select: createdByUserSelect }
    }
  },
  network: {
    select: {
      uid: true,
      networkName: true,
      providerName: true,
      networkConfig: true,
      createdAt: true,
      createdBy: { select: createdByUserSelect }
    }
  },
  createdAt: true,
  createdBy: {
    select: createdByUserSelect,
  },
  updatedAt: true,
});
