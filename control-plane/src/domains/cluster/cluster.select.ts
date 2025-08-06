import { Prisma } from '@prisma/client';

export const createClusterResultSelect = Prisma.validator<Prisma.ClusterSelect>()({
  uid: true,
  name: true,
  description: true,
  status: true,
  statusReason: true,
  latestEvent: true,
  services: {
    select: {
      version: {
        select: {
          version: true,
        },
      },
      service: {
        select: {
          uid: true,
          name: true,
          displayName: true,
        },
      },
    },
  },
  currentConfig: {
    select: {
      uid: true,
      version: true,
      clusterTshirtSize: {
        select: {
          uid: true,
          provider: true,
          name: true,
          isFreeTier: true,
          nodeInstanceTypes: true,
        },
      },
    },
  },
  createdAt: true,
  createdBy: {
    select: {
      uid: true,
      email: true,
      fullName: true,
      avatarUrl: true,
    },
  },
});
