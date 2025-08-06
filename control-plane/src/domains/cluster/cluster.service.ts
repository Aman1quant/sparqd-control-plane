import logger from '@/config/logger';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { PrismaClient, Cluster, ClusterStatus, ClusterConfig, ClusterAutomationJob, Prisma } from '@prisma/client';
import { startClusterWorkflow } from './clusterWorkflow.service';

const prisma = new PrismaClient();

export interface ClusterFilters {
  name?: string;
  description?: string;
  workspaceUid?: string;
  status?: ClusterStatus;
  tshirtSize?: string;
  createdById?: number;
  page?: number;
  limit?: number;
}

export interface ServiceData {
  name: string;
}

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

type DetailCluster = Prisma.ClusterGetPayload<{
  select: typeof detailClusterSelect;
}>;

export async function listCluster({
  name,
  description,
  workspaceUid,
  status,
  page = 1,
  limit = 10,
}: ClusterFilters): Promise<PaginatedResponse<DetailCluster | null>> {
  const whereClause: Record<string, unknown> = {};

  whereClause.workspaceUid = workspaceUid;

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

  if (status) {
    whereClause.status = status;
  }

  const [totalData, clusters] = await Promise.all([
    prisma.cluster.count({ where: whereClause }),
    prisma.cluster.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      select: detailClusterSelect,
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

/******************************************************************************
 * Describe a cluster
 *****************************************************************************/
export async function detailCluster(uid: string): Promise<DetailCluster | null> {
  const cluster = await prisma.cluster.findUnique({
    where: { uid },
    select: detailClusterSelect,
  });

  if (!cluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  return cluster;
}

/******************************************************************************
 * Create a cluster
 *****************************************************************************/
export interface CreateClusterServiceSelection {
  serviceUid: string;
  serviceVersionUid: string;
}

export interface CreateClusterData {
  name: string;
  description?: string;
  workspaceUid: string;
  clusterTshirtSizeUid: string;
  userUid: string;
  serviceSelections: CreateClusterServiceSelection[];
}

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

type CreateClusterResult = Prisma.ClusterGetPayload<{
  select: typeof createClusterResultSelect;
}>;

export async function createCluster(data: CreateClusterData): Promise<CreateClusterResult | null> {
  const workspaceExists = await prisma.workspace.findUnique({
    where: { uid: data.workspaceUid },
  });

  if (!workspaceExists) {
    throw {
      status: 404,
      message: 'Workspace not found',
    };
  }

  const user = await prisma.user.findUnique({
    where: { uid: data.userUid },
  });

  if (!user) {
    throw {
      status: 404,
      message: 'User not found',
    };
  }

  const clusterTshirtSize = await prisma.clusterTshirtSize.findUnique({ where: { uid: data.clusterTshirtSizeUid } });
  if (!clusterTshirtSize) {
    throw {
      status: 404,
      message: 'Cluster Tshirt Size does not exist',
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
        createdById: user.id,
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
        version: 1,
        clusterTshirtSizeId: clusterTshirtSize.id,
        createdById: user.id,
      },
      select: {
        id: true,
        uid: true,
        version: true,
        createdAt: true,
        clusterTshirtSize: true,
      },
    });

    // 3. Set the cluster config as current config
    await transactionPrisma.cluster.update({
      where: { id: cluster.id },
      data: { currentConfigId: clusterConfig.id },
    });

    // 4. Create service config

    // 5. Create service instances
    const serviceVersionUids = data.serviceSelections.map((sel) => sel.serviceVersionUid);
    const versionData = await prisma.serviceVersion.findMany({
      where: { uid: { in: serviceVersionUids } },
      select: {
        id: true,
        uid: true,
        service: {
          select: {
            id: true,
            uid: true,
          },
        },
      },
    });
    logger.info('versionData', versionData);

    for (let index = 0; index < versionData.length; index++) {
      const vd = versionData[index];

      // Get serviceVersionId
      await transactionPrisma.serviceInstance.create({
        data: {
          clusterId: cluster.id,
          serviceId: vd.service.id,
          versionId: vd.id,
          configId: cluster.currentConfigId,
        },
      });
    }

    // 6. Create automation job directly with transaction prisma
    const automationJob = await transactionPrisma.clusterAutomationJob.create({
      data: {
        clusterId: cluster.id,
        type: 'CREATE',
        status: 'PENDING',
        createdById: user.id,
      },
    });

    // 7. Start cluster create job
    const workflowId = startClusterWorkflow({
      op: 'create',
      cluster: cluster,
      //   overrides: {}
    });
    logger.info('workflowId', workflowId);

    // logger.info(`Automation job created with ID: ${automationJob.id}, Type: ${automationJob.type}`);

    const result = await transactionPrisma.cluster.findUnique({
      where: { uid: cluster.uid },
      select: createClusterResultSelect,
    });
    return result;
  });
  return result;
}

/******************************************************************************
 * Update a cluster
 *****************************************************************************/
export interface UpdateClusterData {
  name?: string;
  description?: string;
  tshirtSize?: string;
  status?: ClusterStatus;
  statusReason?: string;
  metadata?: object;
}

export async function updateCluster(uid: string, data: UpdateClusterData): Promise<DetailCluster | null> {
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
    data: data,
    select: detailClusterSelect,
  });

  return updatedCluster;
}

/******************************************************************************
 * Delete a cluster
 *****************************************************************************/
export async function deleteCluster(uid: string): Promise<DetailCluster | null> {
  const existingCluster = await prisma.cluster.findUnique({
    where: { uid },
  });

  if (!existingCluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const deletedCluster = await prisma.cluster.update({
    where: { uid },
    data: {
      status: 'DELETING',
    },
    select: detailClusterSelect,
  });

  if (deletedCluster.status === 'DELETING') {
    startClusterWorkflow({
      op: 'delete',
      cluster: existingCluster,
    });
  }

  // // Use transaction to delete cluster and all related data after physical deletion successful
  // const result = await prisma.$transaction(async (transactionPrisma) => {
  //   // 1. Delete all cluster automation jobs first
  //   await transactionPrisma.clusterAutomationJob.deleteMany({
  //     where: { clusterId: existingCluster.id },
  //   });

  //   // 2. Delete all cluster configs
  //   await transactionPrisma.clusterConfig.deleteMany({
  //     where: { clusterId: existingCluster.id },
  //   });

  //   // 3. Delete service instances if any
  //   await transactionPrisma.serviceInstance.deleteMany({
  //     where: { clusterId: existingCluster.id },
  //   });

  //   // 4. Delete usage records if any
  //   await transactionPrisma.usage.deleteMany({
  //     where: { clusterId: existingCluster.id },
  //   });

  //   // 5. Delete billing records if any
  //   await transactionPrisma.billingRecord.deleteMany({
  //     where: { clusterId: existingCluster.id },
  //   });

  //   // 6. Finally delete the cluster
  //   const deletedCluster = await transactionPrisma.cluster.delete({
  //     where: { id: existingCluster.id },
  //   });

  //   return deletedCluster;
  // });

  return deletedCluster;
}
