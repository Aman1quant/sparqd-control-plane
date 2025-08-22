import { startClusterWorkflow } from '@domains/clusterWorkflow/clusterWorkflow.service';
import { Prisma, PrismaClient } from '@prisma/client';

import config from '@/config/config';
import logger from '@/config/logger';
import { HttpError } from '@/types/errors';
import { offsetPagination } from '@/utils/api';
import { ClusterProvisionConfig, ClusterProvisionConfigInput, clusterProvisionConfigSchema } from '@/workflow/clusterProvisioning/clusterProvisioning.type';

import { accountNetworkConfigSchema, accountStorageBackendConfigSchema } from '../account/account.type';
import { createClusterOutputSelect, getClusterSelect } from './cluster.select';
import { Cluster, ClusterFilters, ClusterList, CreateClusterInput, CreateClusterOutput, PartialClusterPatchInput } from './cluster.type';

const prisma = new PrismaClient();

/******************************************************************************
 * Create a cluster
 *****************************************************************************/
export async function createClusterTx(input: CreateClusterInput): Promise<CreateClusterOutput> {
  // Start a transaction to ensure all operations succeed or fail together
  const result = await prisma.$transaction(async (tx) => {
    // Check workspace
    const workspace = await prisma.workspace.findUnique({ where: { uid: input.workspaceUid }, include: { account: true } });
    if (!workspace) {
      throw new HttpError(404, 'Workspace not found');
    }

    // Get accountStorage & accountNetwork
    const accountStorage = await prisma.accountStorage.findUnique({
      where: { id: workspace.storageId },
      include: { account: { include: { region: { include: { cloudProvider: true } } } } },
    });
    if (!accountStorage) {
      throw new HttpError(404, 'Storage not found');
    }
    const accountNetwork = await prisma.accountNetwork.findUnique({
      where: { id: workspace.networkId },
      include: { account: { include: { region: { include: { cloudProvider: true } } } } },
    });
    if (!accountNetwork) {
      throw new HttpError(404, 'Network not found');
    }
    logger.debug({ accountNetwork, accountStorage });

    // Check Tshirt Size
    const clusterTshirtSize = await prisma.clusterTshirtSize.findUnique({ where: { uid: input.clusterTshirtSizeUid } });
    if (!clusterTshirtSize) {
      throw new HttpError(404, 'Cluster tshirt size not found');
    }

    // TODO:
    // Check for quota. Fail the request if quota policy not allowing.
    // Might be on different service code
    // and called on route before calling createCluster

    // 1. Create the cluster object
    const cluster = await tx.cluster.create({
      data: {
        name: input.name,
        description: input.description,
        workspaceId: workspace.id,
        createdById: input.userId,
      },
    });

    if (!cluster) {
      throw new HttpError(500, 'Failed to create cluster');
    }

    // 2. Create event
    const clusterEvent = await tx.clusterEvent.create({
      data: {
        clusterId: cluster.id,
        before: {
          status: null,
          statusReason: null,
        },
        after: {
          status: cluster.status,
          statusReason: cluster.statusReason,
        },
      },
    });

    // Update latest event id on cluster
    await tx.cluster.update({
      where: { id: cluster.id },
      data: {
        latestEventId: clusterEvent.id,
      },
    });

    // 3. Create cluster config object
    const provisionConfig = await generateClusterProvisionConfig({
      accountPlan: workspace.account.plan,
      accountStorage,
      accountNetwork,
      workspace,
      cluster,
      clusterTshirtSize,
    });

    const clusterConfig = await tx.clusterConfig.create({
      data: {
        clusterId: cluster.id,
        version: 1,
        clusterTshirtSizeId: clusterTshirtSize.id,
        provisionConfig: provisionConfig as unknown as Prisma.InputJsonValue,
        createdById: input.userId,
      },
      select: {
        id: true,
        uid: true,
        version: true,
        createdAt: true,
        clusterTshirtSize: true,
      },
    });

    // Set the cluster config as current config
    await tx.cluster.update({
      where: { id: cluster.id },
      data: { currentConfigId: clusterConfig.id },
    });

    // 4. Create service config object

    // 5. Create service instance objects
    const serviceVersionUids = input.serviceSelections.map((sel) => sel.serviceVersionUid);
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

    for (let index = 0; index < versionData.length; index++) {
      const vd = versionData[index];

      // Get serviceVersionId
      await tx.serviceInstance.create({
        data: {
          clusterId: cluster.id,
          serviceId: vd.service.id,
          versionId: vd.id,
          configId: cluster.currentConfigId,
        },
      });
    }

    // 6. Start cluster create job
    // const workflowId = startClusterWorkflow('CREATE', provisionConfig);
    // logger.info('workflowId', workflowId);

    const result = await tx.cluster.findUnique({
      where: { uid: cluster.uid },
      select: createClusterOutputSelect,
    });
    return result;
  });
  if (!result) {
    throw new HttpError(500, 'Failed to create cluster');
  }
  return result;
}

async function generateClusterProvisionConfig(input: ClusterProvisionConfigInput): Promise<ClusterProvisionConfig> {
  // Parse storage config & validate schema
  const storageConfigParsed = accountStorageBackendConfigSchema.safeParse(input.accountStorage.backendConfig);
  if (!storageConfigParsed.data) {
    throw new HttpError(500, 'Failed to parse storageConfig');
  }

  // Parse network config & validate schema
  const networkConfigParsed = accountNetworkConfigSchema.safeParse(input.accountNetwork.networkConfig);
  if (!networkConfigParsed.data) {
    logger.debug(input.accountNetwork.networkConfig, 'networkConfig');
    throw new HttpError(500, 'Failed to parse networkConfig');
  }

  // Prepare provisionConfig
  const provisionConfig: ClusterProvisionConfig = {} as ClusterProvisionConfig;

  // Common standard values
  provisionConfig.clusterUid = input.cluster.uid;
  provisionConfig.tofuTemplateDir = config.tofu.tofuTemplateDir;
  provisionConfig.tofuBackendConfig = storageConfigParsed.data;

  // Handle Free Tier vs Paid
  switch (input.accountPlan) {
    case 'free':
      provisionConfig.tofuTemplatePath = 'aws/aws-tenant-free-tier';
      provisionConfig.tofuTfvars = {
        region: config.provisioningFreeTierAWS.defaultRegion,
        shared_subnet_ids: config.provisioningFreeTierAWS.subnetIds,
        shared_eks_cluster_name: config.provisioningFreeTierAWS.eks_cluster_name,
        shared_bucket_name: config.provisioningFreeTierAWS.s3Bucket,
        tenant_bucket_data_path: `${input.accountStorage.root}${input.accountStorage.dataPath}`,
        tenant_bucket_workspace_path: `${input.accountStorage.root}${input.accountStorage.workspacePath}`,
        tenant_node_instance_types: input.clusterTshirtSize.nodeInstanceTypes,
        tenant_cluster_uid: input.cluster.uid,
        tenant_node_desired_size: 1,
        tenant_node_min_size: 1,
        tenant_node_max_size: 1,
      };

      break;
    case 'enterprise':
      throw new HttpError(400, `${input.accountPlan} plan not supprted yet`);
    default:
      throw new HttpError(400, `${input.accountPlan} plan not supprted yet`);
  }

  logger.debug({ provisionConfig }, 'Generated provisionConfig');

  return provisionConfig;
}

/******************************************************************************
 * List accessible clusters
 *****************************************************************************/
export async function listClusters({ userId, name, description, workspaceName, status, page = 1, limit = 10 }: ClusterFilters): Promise<ClusterList> {
  const whereClause: Record<string, unknown> = {};

  // By default always include workspace members
  if (workspaceName) {
    whereClause.workspace = {
      members: {
        some: { userId: userId },
      },
      name: {
        contains: workspaceName,
        mode: 'insensitive' as const,
      },
    };
  } else {
    whereClause.workspace = {
      members: {
        some: { userId: userId },
      },
    };
  }

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
      select: getClusterSelect,
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
 * Get a cluster
 *****************************************************************************/
export async function getCluster(uid: string, userId: bigint): Promise<Cluster | null> {
  const cluster = await prisma.cluster.findUnique({
    where: {
      uid,
      workspace: {
        members: {
          some: { userId: userId },
        },
      },
    },
    select: getClusterSelect,
  });

  if (!cluster) {
    throw new HttpError(404, 'Cluster not found');
  }

  return cluster;
}

/******************************************************************************
 * Patch a cluster
 *****************************************************************************/
export async function patchCluster(uid: string, userId: bigint, data: PartialClusterPatchInput): Promise<Cluster> {
  const cluster = await prisma.cluster.findUnique({
    where: {
      uid,
      workspace: {
        members: {
          some: { userId: userId },
        },
      },
    },
    select: getClusterSelect,
  });

  if (!cluster) {
    throw new HttpError(404, 'Cluster not found');
  }

  const updatedCluster = await prisma.cluster.update({
    where: { uid },
    data: data,
    select: getClusterSelect,
  });

  return updatedCluster;
}

/******************************************************************************
 * Delete a cluster
 *****************************************************************************/
export async function deleteCluster(uid: string, userId: bigint): Promise<Cluster> {
  const cluster = await prisma.cluster.findUnique({
    where: {
      uid,
      workspace: {
        members: {
          some: { userId: userId },
        },
      },
    },
  });

  if (!cluster) {
    throw new HttpError(404, 'Cluster not found');
  }

  const clusterConfig = await prisma.clusterConfig.findUnique({
    where: { id: cluster.currentConfigId as bigint },
  });

  if (!clusterConfig) {
    throw new HttpError(404, 'Cluster config not found');
  }

  const deletedCluster = await prisma.cluster.update({
    where: { uid },
    data: {
      status: 'DELETING',
    },
    select: getClusterSelect,
  });

  // Parse storage config & validate schema
  const provisionConfigParsed = clusterProvisionConfigSchema.safeParse(clusterConfig.provisionConfig);
  if (!provisionConfigParsed.data) {
    throw {
      status: 500,
      message: 'Failed to parse provisionConfig',
    };
  }

  if (deletedCluster.status === 'DELETING') {
    const workflowId = startClusterWorkflow('DELETE', provisionConfigParsed.data);
    logger.debug({ workflowId });
  }

  return deletedCluster;
}
