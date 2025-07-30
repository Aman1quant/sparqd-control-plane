import logger from '@/config/logger';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { PrismaClient, Cluster, ClusterStatus, ClusterConfig, ClusterAutomationJob } from '@prisma/client';

const prisma = new PrismaClient();

interface ClusterFilters {
  name?: string;
  description?: string;
  workspaceUid?: string;
  status?: ClusterStatus;
  tshirtSize?: string;
  createdById?: number;
  page?: number;
  limit?: number;
}

export interface CreateClusterData {
  name: string;
  description?: string;
  workspaceUid: string;
  tshirtSize: string;
  status?: ClusterStatus;
  statusReason?: string;
  metadata?: object;
  createdById?: bigint;
  // Fields for automatic cluster config creation
  configVersion?: number;
  services?: object;
  rawSpec?: object;
  // Field for automatic automation job creation
  initialJobType?: string;
}

// Type for the complete cluster creation result
export interface CreateClusterResult {
  cluster: Cluster;
  clusterConfig: ClusterConfig;
  automationJob: ClusterAutomationJob;
}

interface UpdateClusterData {
  name?: string;
  description?: string;
  tshirtSize?: string;
  status?: ClusterStatus;
  statusReason?: string;
  metadata?: object;
}

export async function listCluster({
  name,
  description,
  workspaceUid,
  status,
  tshirtSize,
  createdById,
  page = 1,
  limit = 10,
}: ClusterFilters): Promise<PaginatedResponse<Cluster>> {
  const whereClause: Record<string, unknown> = {};

  if (name) {
    whereClause.name = {
      contains: name,
      mode: 'insensitive' as const,
    };
  }

  if (description) {
    whereClause.description = {
      contains: description,
      mode: 'insensitive' as const,
    };
  }

  if (workspaceUid) {
    whereClause.workspaceUid = workspaceUid;
  }

  if (status) {
    whereClause.status = status;
  }

  if (tshirtSize) {
    whereClause.tshirtSize = tshirtSize;
  }

  if (createdById) {
    whereClause.createdById = createdById;
  }

  const [totalData, clusters] = await Promise.all([
    prisma.cluster.count({ where: whereClause }),
    prisma.cluster.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      include: {
        workspace: {
          select: {
            uid: true,
            name: true,
            account: {
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
        currentConfig: {
          select: {
            uid: true,
            version: true,
            tshirtSize: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: clusters,
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

export async function detailCluster(uid: string): Promise<Cluster | null> {
  const cluster = await prisma.cluster.findUnique({
    where: { uid },
    include: {
      workspace: {
        select: {
          uid: true,
          name: true,
          account: {
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
      currentConfig: {
        select: {
          uid: true,
          version: true,
          tshirtSize: true,
          rawSpec: true,
        },
      },
      configs: {
        select: {
          uid: true,
          version: true,
          tshirtSize: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      services: {
        select: {
          uid: true,
          service: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!cluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  return cluster;
}

export async function createCluster(data: CreateClusterData): Promise<CreateClusterResult> {
  logger.info(`create cluster`)
  const workspaceExists = await prisma.workspace.findUnique({
    where: { uid: data.workspaceUid },
  });

  if (!workspaceExists) {
    throw {
      status: 404,
      message: 'Workspace not found',
    };
  }

  // Start a transaction to ensure all operations succeed or fail together
  const result = await prisma.$transaction(async (transactionPrisma) => {
    // 1. Create the cluster
    const cluster = await transactionPrisma.cluster.create({
      data: {
        name: data.name,
        description: data.description,
        workspaceId: workspaceExists.id,
        tshirtSize: data.tshirtSize,
        status: data.status || 'CREATING',
        statusReason: data.statusReason,
        metadata: data.metadata,
        createdById: data.createdById,
      },
    });

    if (!cluster) {
      throw {
        status: 500,
        message: 'Failed to create cluster',
      };
    }

    // 2. Create cluster config directly with transaction prisma
    const clusterConfig = await transactionPrisma.clusterConfig.create({
      data: {
        clusterId: cluster.id,
        version: data.configVersion || 1,
        tshirtSize: data.tshirtSize,
        services: data.services || {},
        rawSpec: data.rawSpec || {},
        createdById: data.createdById,
      },
    });

    // 3. Set the cluster config as current config
    await transactionPrisma.cluster.update({
      where: { id: cluster.id },
      data: { currentConfigId: clusterConfig.id },
    });

    // 4. Create automation job directly with transaction prisma
    const automationJob = await transactionPrisma.clusterAutomationJob.create({
      data: {
        clusterId: cluster.id,
        type: data.initialJobType || 'CREATE',
        status: 'PENDING',
        createdById: data.createdById,
      },
    });

    logger.info(`Automation job created with ID: ${automationJob.id}, Type: ${automationJob.type}`);

    return {
      cluster,
      clusterConfig,
      automationJob,
    };
  });

  return result;
}

export async function updateCluster(uid: string, data: UpdateClusterData): Promise<Cluster> {
  const existingCluster = await prisma.cluster.findUnique({
    where: { uid },
  });

  if (!existingCluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const updatedCluster = await prisma.cluster.update({
    where: { uid },
    data,
  });

  return updatedCluster;
}

export async function deleteCluster(uid: string): Promise<Cluster> {
  const existingCluster = await prisma.cluster.findUnique({
    where: { uid },
  });

  if (!existingCluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  // Use transaction to delete cluster and all related data
  const result = await prisma.$transaction(async (transactionPrisma) => {
    // 1. Delete all cluster automation jobs first
    await transactionPrisma.clusterAutomationJob.deleteMany({
      where: { clusterId: existingCluster.id },
    });

    // 2. Delete all cluster configs
    await transactionPrisma.clusterConfig.deleteMany({
      where: { clusterId: existingCluster.id },
    });

    // 3. Delete service instances if any
    await transactionPrisma.serviceInstance.deleteMany({
      where: { clusterId: existingCluster.id },
    });

    // 4. Delete usage records if any
    await transactionPrisma.usage.deleteMany({
      where: { clusterId: existingCluster.id },
    });

    // 5. Delete billing records if any
    await transactionPrisma.billingRecord.deleteMany({
      where: { clusterId: existingCluster.id },
    });

    // 6. Finally delete the cluster
    const deletedCluster = await transactionPrisma.cluster.delete({
      where: { uid },
    });

    return deletedCluster;
  });

  return result;
}
