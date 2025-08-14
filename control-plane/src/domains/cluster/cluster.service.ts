import * as ClusterTshirtSizeService from '@domains/clusterTshirtSize/clusterTshirtSize.service';
import { startClusterWorkflow } from '@domains/clusterWorkflow/clusterWorkflow.service';
import * as WorkspaceService from '@domains/workspace/workspace.service';
import { AccountNetwork, AccountStorage, ClusterTshirtSize, Prisma, PrismaClient } from '@prisma/client';

import config from '@/config/config';
import logger from '@/config/logger';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { ClusterProvisionConfig, clusterProvisionConfigSchema } from '@/workflow/clusterProvisioning/clusterProvisioning.type';

import { accountStorageConfigSchema, awsAccountNetworkConfigSchema } from '../account/account.type';
import { createClusterResultSelect, deletedClusterSelect, detailClusterSelect } from './cluster.select';
import { ClusterFilters, CreateClusterInput, CreateClusterResult, DetailCluster, UpdateClusterData } from './cluster.type';

const prisma = new PrismaClient();

/******************************************************************************
 * Create a cluster
 *****************************************************************************/
export async function createCluster(data: CreateClusterInput): Promise<CreateClusterResult | null> {
  // Check workspace
  const workspace = await WorkspaceService.checkWorkspaceExists(data.workspace.uid);

  // Get accountStorage & accountNetwork
  const accountStorage = await prisma.accountStorage.findUniqueOrThrow({
    where: { id: workspace.storageId },
    include: { account: { include: { region: { include: { cloudProvider: true } } } } },
  });
  const accountNetwork = await prisma.accountNetwork.findUniqueOrThrow({
    where: { id: workspace.networkId },
    include: { account: { include: { region: { include: { cloudProvider: true } } } } },
  });

  logger.debug({ accountNetwork, accountStorage });

  // Check Tshirt Size
  const clusterTshirtSize = await ClusterTshirtSizeService.checkClusterTshirtSizeExists(data.clusterTshirtSizeUid);

  // TODO:
  // Check for quota. Fail the request if quota policy not allowing.
  // Might be on different service code
  // and called on route before calling createCluster

  // Start a transaction to ensure all operations succeed or fail together
  const result = await prisma.$transaction(async (transactionPrisma) => {
    // 1. Create the cluster object
    const cluster = await transactionPrisma.cluster.create({
      data: {
        name: data.name,
        description: data.description,
        workspaceId: workspace.id,
        createdById: data.userId,
      },
    });

    if (!cluster) {
      throw {
        status: 500,
        message: 'Failed to create cluster',
      };
    }

    // 2. Create cluster config object
    const provisionConfig = await generateClusterProvisionConfig({
      op: 'CREATE',
      providerName: accountStorage.account.region.cloudProvider.name,
      isFreeTier: data.account.plan === 'FREE',
      accountStorage,
      accountNetwork,
      clusterUid: cluster.uid,
      clusterTshirtSize,
    });

    const clusterConfig = await transactionPrisma.clusterConfig.create({
      data: {
        clusterId: cluster.id,
        version: 1,
        clusterTshirtSizeId: clusterTshirtSize.id,
        provisionConfig: provisionConfig as unknown as Prisma.InputJsonValue,
        createdById: data.userId,
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

    // 4. Create service config object

    // 5. Create service instance objects
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

    // // 6. Create automation job directly with transaction prisma
    // const automationJob = await transactionPrisma.clusterAutomationJob.create({
    //   data: {
    //     clusterId: cluster.id,
    //     type: 'CREATE',
    //     status: 'PENDING',
    //     createdById: data.userId,
    //   },
    // });

    // 7. Start cluster create job
    const workflowId = startClusterWorkflow('CREATE', provisionConfig);
    logger.info('workflowId', workflowId);

    const result = await transactionPrisma.cluster.findUnique({
      where: { uid: cluster.uid },
      select: createClusterResultSelect,
    });
    return result;
  });
  return result;
}

async function generateClusterProvisionConfig(data: {
  op: string;
  isFreeTier: boolean;
  providerName: string;
  accountStorage: AccountStorage;
  accountNetwork: AccountNetwork;
  clusterUid: string;
  clusterTshirtSize: ClusterTshirtSize;
}): Promise<ClusterProvisionConfig> {
  // Parse storage config & validate schema
  const storageConfigParsed = accountStorageConfigSchema.safeParse(data.accountStorage.storageConfig);
  if (!storageConfigParsed.data) {
    throw {
      status: 500,
      message: 'Failed to parse storageConfig',
    };
  }

  // Parse network config & validate schema
  const networkConfigParsed = awsAccountNetworkConfigSchema.safeParse(data.accountNetwork.networkConfig);
  if (!networkConfigParsed.data) {
    throw {
      status: 500,
      message: 'Failed to parse networkConfig',
    };
  }

  let provisionConfig: ClusterProvisionConfig = {} as ClusterProvisionConfig;
  const tofuTemplateDir = config.tofu.tofuTemplateDir;

  switch (data.providerName) {
    case 'AWS':
      if (data.isFreeTier) {
        provisionConfig = {
          clusterUid: data.clusterUid,
          tofuBackendConfig: storageConfigParsed.data.tofuBackend,
          tofuTemplateDir,
          tofuTemplatePath: 'aws/aws-tenant-free-tier',
          tofuTfvars: {
            region: config.provisioningFreeTierAWS.defaultRegion,
            shared_subnet_ids: networkConfigParsed.data.config.subnetIds,
            shared_eks_cluster_name: config.provisioningFreeTierAWS.eks_cluster_name,
            shared_bucket_name: config.provisioningFreeTierAWS.s3Bucket,
            tenant_bucket_path: storageConfigParsed.data.dataPath,
            tenant_node_instance_types: data.clusterTshirtSize.nodeInstanceTypes,
            tenant_cluster_uid: data.clusterUid,
            tenant_node_desired_size: 1,
            tenant_node_min_size: 1,
            tenant_node_max_size: 1,
          },
        };
      }

      break;
    default:
      throw {
        status: 400,
        message: `Provider ${data.providerName} not supported`,
      };
  }
  logger.debug({ provisionConfig }, 'Generated provisionConfig');

  return provisionConfig;
}

/******************************************************************************
 * List accessible clusters
 *****************************************************************************/
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
export async function describeCluster(uid: string): Promise<DetailCluster | null> {
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
 * Update a cluster
 *****************************************************************************/
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
    select: deletedClusterSelect,
  });

  if (!existingCluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const clusterConfig = await prisma.clusterConfig.findUnique({
    where: { id: existingCluster.currentConfigId as bigint },
  });

  if (!clusterConfig) {
    throw {
      status: 404,
      message: 'Cluster found with no config',
    };
  }

  const deletedCluster = await prisma.cluster.update({
    where: { uid },
    data: {
      status: 'DELETING',
    },
    select: detailClusterSelect,
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
