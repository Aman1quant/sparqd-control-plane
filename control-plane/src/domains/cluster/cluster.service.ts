import { startClusterWorkflow } from '@domains/clusterWorkflow/clusterWorkflow.service';
import { AccountNetwork, AccountStorage, ClusterTshirtSize, Prisma, PrismaClient } from '@prisma/client';

import config from '@/config/config';
import logger from '@/config/logger';
import { HttpError } from '@/types/errors';
import { ClusterProvisionConfig } from '@/workflow/clusterProvisioning/clusterProvisioning.type';

import { accountNetworkConfigSchema, accountStorageBackendConfigSchema } from '../account/account.type';
import { clusterCreateResultSelect } from './cluster.select';
import { ClusterCreateInput, ClusterCreateResult } from './cluster.type';

// import { accountStorageConfigSchema, awsAccountNetworkConfigSchema } from '../account/account.type';
// import { createClusterResultSelect, deletedClusterSelect, detailClusterSelect } from './cluster.select';
// import { ClusterFilters, CreateClusterInput, CreateClusterResult, DetailCluster, UpdateClusterData } from './cluster.type';

const prisma = new PrismaClient();

/******************************************************************************
 * Create a cluster
 *****************************************************************************/
export async function createClusterTx(input: ClusterCreateInput): Promise<ClusterCreateResult> {
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

  // Start a transaction to ensure all operations succeed or fail together
  const result = await prisma.$transaction(async (tx) => {
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

    // 2. Create cluster config object
    const provisionConfig = await generateClusterProvisionConfig({
      op: 'CREATE',
      providerName: accountStorage.providerName,
      isFreeTier: workspace.account.plan === 'free',
      accountStorage,
      accountNetwork,
      clusterUid: cluster.uid,
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

    // 3. Set the cluster config as current config
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
    const workflowId = startClusterWorkflow('CREATE', provisionConfig);
    logger.info('workflowId', workflowId);

    const result = await tx.cluster.findUnique({
      where: { uid: cluster.uid },
      select: clusterCreateResultSelect,
    });
    return result;
  });
  if (!result) {
    throw new HttpError(500, 'Failed to create cluster');
  }
  return result;
}

async function generateClusterProvisionConfig(input: {
  op: string;
  isFreeTier: boolean;
  providerName: string;
  accountStorage: AccountStorage;
  accountNetwork: AccountNetwork;
  clusterUid: string;
  clusterTshirtSize: ClusterTshirtSize;
}): Promise<ClusterProvisionConfig> {
  // Parse storage config & validate schema
  const storageConfigParsed = accountStorageBackendConfigSchema.safeParse(input.accountStorage.backendConfig);
  if (!storageConfigParsed.data) {
    throw {
      status: 500,
      message: 'Failed to parse storageConfig',
    };
  }

  // Parse network config & validate schema
  const networkConfigParsed = accountNetworkConfigSchema.safeParse(input.accountNetwork.networkConfig);
  if (!networkConfigParsed.data) {
    throw {
      status: 500,
      message: 'Failed to parse networkConfig',
    };
  }

  let provisionConfig: ClusterProvisionConfig = {} as ClusterProvisionConfig;
  const tofuTemplateDir = config.tofu.tofuTemplateDir;

  switch (input.providerName) {
    case 'aws':
      if (input.isFreeTier) {
        provisionConfig = {
          clusterUid: input.clusterUid,
          tofuBackendConfig: storageConfigParsed.data,
          tofuTemplateDir,
          tofuTemplatePath: 'aws/aws-tenant-free-tier',
          tofuTfvars: {
            region: config.provisioningFreeTierAWS.defaultRegion,
            shared_subnet_ids: networkConfigParsed.data,
            shared_eks_cluster_name: config.provisioningFreeTierAWS.eks_cluster_name,
            shared_bucket_name: config.provisioningFreeTierAWS.s3Bucket,
            tenant_bucket_data_path: `${input.accountStorage.root}${input.accountStorage.dataPath}`,
            tenant_bucket_workspace_path: `${input.accountStorage.root}${input.accountStorage.workspacePath}`,
            tenant_node_instance_types: input.clusterTshirtSize.nodeInstanceTypes,
            tenant_cluster_uid: input.clusterUid,
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
        message: `Provider ${input.providerName} not supported`,
      };
  }
  logger.debug({ provisionConfig }, 'Generated provisionConfig');

  return provisionConfig;
}

// /******************************************************************************
//  * List accessible clusters
//  *****************************************************************************/
// export async function listCluster({
//   name,
//   description,
//   workspaceUid,
//   status,
//   page = 1,
//   limit = 10,
// }: ClusterFilters): Promise<PaginatedResponse<DetailCluster | null>> {
//   const whereClause: Record<string, unknown> = {};

//   whereClause.workspaceUid = workspaceUid;

//   if (name) {
//     whereClause.name = {
//       contains: name,
//       mode: 'insensitive' as const,
//     };
//   }

//   if (description) {
//     whereClause.description = {
//       contains: description,
//       mode: 'insensitive' as const,
//     };
//   }

//   if (status) {
//     whereClause.status = status;
//   }

//   const [totalData, clusters] = await Promise.all([
//     prisma.cluster.count({ where: whereClause }),
//     prisma.cluster.findMany({
//       where: whereClause,
//       orderBy: { createdAt: 'desc' },
//       skip: offsetPagination(page, limit),
//       take: limit,
//       select: detailClusterSelect,
//     }),
//   ]);

//   const totalPages = Math.ceil(totalData / limit);

//   return {
//     data: clusters,
//     pagination: {
//       totalData,
//       totalPages,
//       currentPage: page,
//       limit,
//       hasNextPage: page < totalPages,
//       hasPreviousPage: page > 1,
//     },
//   };
// }

// /******************************************************************************
//  * Describe a cluster
//  *****************************************************************************/
// export async function describeCluster(uid: string): Promise<DetailCluster | null> {
//   const cluster = await prisma.cluster.findUnique({
//     where: { uid },
//     select: detailClusterSelect,
//   });

//   if (!cluster) {
//     throw {
//       status: 404,
//       message: 'Cluster not found',
//     };
//   }

//   return cluster;
// }

// /******************************************************************************
//  * Update a cluster
//  *****************************************************************************/
// export async function updateCluster(uid: string, data: UpdateClusterData): Promise<DetailCluster | null> {
//   const existingCluster = await prisma.cluster.findUnique({
//     where: { uid },
//   });

//   if (!existingCluster) {
//     throw {
//       status: 404,
//       message: 'Cluster not found',
//     };
//   }

//   const updatedCluster = await prisma.cluster.update({
//     where: { uid },
//     data: data,
//     select: detailClusterSelect,
//   });

//   return updatedCluster;
// }

// /******************************************************************************
//  * Delete a cluster
//  *****************************************************************************/
// export async function deleteCluster(uid: string): Promise<DetailCluster | null> {
//   const existingCluster = await prisma.cluster.findUnique({
//     where: { uid },
//     select: deletedClusterSelect,
//   });

//   if (!existingCluster) {
//     throw {
//       status: 404,
//       message: 'Cluster not found',
//     };
//   }

//   const clusterConfig = await prisma.clusterConfig.findUnique({
//     where: { id: existingCluster.currentConfigId as bigint },
//   });

//   if (!clusterConfig) {
//     throw {
//       status: 404,
//       message: 'Cluster found with no config',
//     };
//   }

//   const deletedCluster = await prisma.cluster.update({
//     where: { uid },
//     data: {
//       status: 'DELETING',
//     },
//     select: detailClusterSelect,
//   });

//   // Parse storage config & validate schema
//   const provisionConfigParsed = clusterProvisionConfigSchema.safeParse(clusterConfig.provisionConfig);
//   if (!provisionConfigParsed.data) {
//     throw {
//       status: 500,
//       message: 'Failed to parse provisionConfig',
//     };
//   }

//   if (deletedCluster.status === 'DELETING') {
//     const workflowId = startClusterWorkflow('DELETE', provisionConfigParsed.data);
//     logger.debug({ workflowId });
//   }

//   return deletedCluster;
// }
