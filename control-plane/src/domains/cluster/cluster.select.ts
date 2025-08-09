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

export const detailClusterSelect = Prisma.validator<Prisma.ClusterSelect>()({
  id: false,
  uid: true,
  name: true,
  status: true,
  statusReason: true,
  currentConfig: {
    select: {
      uid: true,
      version: true,
      clusterTshirtSize: {
        select: {
          name: true,
        },
      },
    },
  },
  configs: {
    select: {
      uid: true,
      version: true,
      clusterTshirtSize: {
        select: {
          name: true,
        },
      },
    },
  },
  services: {
    include: {
      service: true,
    },
  },
  workspace: {
    select: {
      uid: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
});

export const deletedClusterSelect = Prisma.validator<Prisma.ClusterSelect>()({
  uid: true,
  name: true,
  status: true,
  statusReason: true,
  currentConfigId: true,
  createdAt: true,
  updatedAt: true,
});