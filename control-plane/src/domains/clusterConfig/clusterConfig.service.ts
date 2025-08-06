import { ClusterConfig, PrismaClient } from '@prisma/client';

import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

const prisma = new PrismaClient();

interface ClusterConfigFilters {
  clusterId?: number;
  version?: number;
  tshirtSize?: string;
  createdById?: number;
  page?: number;
  limit?: number;
}

interface CreateClusterConfigData {
  clusterId: number;
  version: number;
  clusterTshirtSizeId: bigint;
  services: object;
  rawSpec: object;
  createdById?: bigint;
}

interface UpdateClusterConfigData {
  version?: number;
  tshirtSize?: string;
  services?: object;
  rawSpec?: object;
}

export async function listClusterConfig({
  clusterId,
  version,
  tshirtSize,
  createdById,
  page = 1,
  limit = 10,
}: ClusterConfigFilters): Promise<PaginatedResponse<ClusterConfig>> {
  const whereClause: Record<string, unknown> = {};

  if (clusterId) {
    whereClause.clusterId = clusterId;
  }

  if (version) {
    whereClause.version = version;
  }

  if (tshirtSize) {
    whereClause.tshirtSize = tshirtSize;
  }

  if (createdById) {
    whereClause.createdById = createdById;
  }

  const [totalData, clusterConfigs] = await Promise.all([
    prisma.clusterConfig.count({ where: whereClause }),
    prisma.clusterConfig.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      include: {
        cluster: {
          select: {
            uid: true,
            name: true,
            workspace: {
              select: {
                uid: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            uid: true,
            email: true,
            fullName: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: clusterConfigs,
    pagination: {
      totalData,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function detailClusterConfig(uid: string): Promise<ClusterConfig | null> {
  const clusterConfig = await prisma.clusterConfig.findUnique({
    where: { uid },
    include: {
      cluster: {
        select: {
          uid: true,
          name: true,
          workspace: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          uid: true,
          email: true,
          fullName: true,
        },
      },
      currentForCluster: {
        select: {
          uid: true,
          name: true,
        },
      },
    },
  });

  if (!clusterConfig) {
    throw {
      status: 404,
      message: 'Cluster config not found',
    };
  }

  return clusterConfig;
}

export async function createClusterConfig(data: CreateClusterConfigData): Promise<ClusterConfig> {
  const clusterExists = await prisma.cluster.findUnique({
    where: { id: data.clusterId },
  });

  if (!clusterExists) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const clusterConfig = await prisma.clusterConfig.create({
    data,
  });

  if (!clusterConfig) {
    throw {
      status: 500,
      message: 'Failed to create cluster config',
    };
  }

  return clusterConfig;
}

export async function updateClusterConfig(uid: string, data: UpdateClusterConfigData): Promise<ClusterConfig> {
  const existingClusterConfig = await prisma.clusterConfig.findUnique({
    where: { uid },
  });

  if (!existingClusterConfig) {
    throw {
      status: 404,
      message: 'Cluster config not found',
    };
  }

  const updatedClusterConfig = await prisma.clusterConfig.update({
    where: { uid },
    data,
  });

  return updatedClusterConfig;
}

export async function deleteClusterConfig(uid: string): Promise<ClusterConfig> {
  const existingClusterConfig = await prisma.clusterConfig.findUnique({
    where: { uid },
  });

  if (!existingClusterConfig) {
    throw {
      status: 404,
      message: 'Cluster config not found',
    };
  }

  const deletedClusterConfig = await prisma.clusterConfig.delete({
    where: { uid },
  });

  return deletedClusterConfig;
}

export async function setAsCurrentConfig(uid: string): Promise<ClusterConfig> {
  const clusterConfig = await prisma.clusterConfig.findUnique({
    where: { uid },
    include: { cluster: true },
  });

  if (!clusterConfig) {
    throw {
      status: 404,
      message: 'Cluster config not found',
    };
  }

  // Update the cluster to set this config as current
  await prisma.cluster.update({
    where: { id: clusterConfig.clusterId },
    data: { currentConfigId: clusterConfig.id },
  });

  return clusterConfig;
}

export async function getClusterConfigsByCluster(clusterUid: string): Promise<ClusterConfig[]> {
  const cluster = await prisma.cluster.findUnique({
    where: { uid: clusterUid },
  });

  if (!cluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const clusterConfigs = await prisma.clusterConfig.findMany({
    where: { clusterId: cluster.id },
    orderBy: { version: 'desc' },
    include: {
      createdBy: {
        select: {
          uid: true,
          email: true,
          fullName: true,
        },
      },
    },
  });

  return clusterConfigs;
}
