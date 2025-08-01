import logger from '@/config/logger';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { PrismaClient, Cluster, ClusterStatus, ClusterConfig, ClusterAutomationJob, Prisma } from '@prisma/client';
import { connectTemporalClient } from '@/temporal/temporal.client';
import { provisionAWSClusterWorkflow } from '@/temporal/cluster-provisioning/clusterProvisioning.workflow';
import config from '@/config/config';


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
  tshirtSize: true,
  status: true,
  statusReason: true,
  currentConfig: {
    select: {
      uid: true,
      version: true,
      tshirtSize: true,
    },
  },
  configs: {
    select: {
      uid: true,
      version: true,
      tshirtSize: true,
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
  // versions: {
  //   select: {
  //     id: false,
  //     uid: true,
  //     changelog: true,
  //     createdAt: true,
  //     isActive: true,
  //     isDefault: true,
  //     releaseDate: true,
  //   },
  // },
});

type DetailCluster = Prisma.ClusterGetPayload<{
  select: typeof detailClusterSelect;
}>;

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
  tshirtSize: string;
  status?: ClusterStatus;
  statusReason?: string;
  metadata?: object;
  createdById?: bigint;

  // Fields for service selections
  serviceSelections: CreateClusterServiceSelection[];

  // Optional fields for cluster config
  clusterConfigVersion?: number;
  clusterRawSpec?: object;
}

export interface CreateClusterResult {
  cluster: Cluster;
  clusterConfig: ClusterConfig;
  automationJob: ClusterAutomationJob;
}

export async function createCluster(data: CreateClusterData): Promise<CreateClusterResult> {
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
        version: data.clusterConfigVersion || 1,
        tshirtSize: data.tshirtSize,
        services: [],
        rawSpec: data.clusterRawSpec || {},
        createdById: data.createdById,
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
        createdById: data.createdById,
      },
    });

    // 7. Start automation job
    const temporalClient = await connectTemporalClient();
    const handle = await temporalClient.workflow.start(provisionAWSClusterWorkflow, {
      args: [{
        tofuTemplateDir: "/home/tibrahim/clients/quant-data/sparqd-infra-master",
        tofuTemplatePath: "aws/aws-tenant-free-tier",
        tofuTfvars: {
          "region": "ap-southeast-1",
          "shared_subnet_ids": [
            "subnet-05bc434e6d875019e",
            "subnet-0d6f8babc5227b967"
          ],
          "shared_eks_cluster_name": "sparqd-cp-staging",
          "tenant_node_instance_types": [
            "t3.small"
          ],
          "tenant_cluster_uid": cluster.uid,
          "tenant_node_desired_size": 1,
          "tenant_node_min_size": 1,
          "tenant_node_max_size": 1
        },
        s3BackendConfig: {
          bucket: config.provisioningSharedAWS.s3Bucket,
          key: `shared-clusters/${cluster.uid}`,
          region: 'ap-southeast-1',
        },
        clusterUid: cluster.uid,
        isFreeTier: true,
      }],
      taskQueue: 'clusterProvisioning',
      workflowId: `clusterProvisioning/${automationJob.uid}/${Date.now()}`,
    });

    const workflowId = handle.workflowId;
    logger.info('workflowId', workflowId);

    // logger.info(`Automation job created with ID: ${automationJob.id}, Type: ${automationJob.type}`);

    return {
      cluster,
      clusterConfig,
      automationJob,
      workflowId: workflowId,
    };
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

/******************************************************************************
 * Delete a cluster
 *****************************************************************************/
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
      where: { id: existingCluster.id },
    });

    return deletedCluster;
  });

  return result;
}
