"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCluster = createCluster;
exports.listCluster = listCluster;
exports.describeCluster = describeCluster;
exports.updateCluster = updateCluster;
exports.deleteCluster = deleteCluster;
const ClusterTshirtSizeService = __importStar(require("@domains/clusterTshirtSize/clusterTshirtSize.service"));
const clusterWorkflow_service_1 = require("@domains/clusterWorkflow/clusterWorkflow.service");
const WorkspaceService = __importStar(require("@domains/workspace/workspace.service"));
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("@/config/config"));
const logger_1 = __importDefault(require("@/config/logger"));
const api_1 = require("@/utils/api");
const clusterProvisioning_type_1 = require("@/workflow/clusterProvisioning/clusterProvisioning.type");
const account_type_1 = require("../account/account.type");
const cluster_select_1 = require("./cluster.select");
const prisma = new client_1.PrismaClient();
/******************************************************************************
 * Create a cluster
 *****************************************************************************/
function createCluster(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check workspace
        const workspace = yield WorkspaceService.checkWorkspaceExists(data.workspace.uid);
        // Get accountStorage & accountNetwork
        const accountStorage = yield prisma.accountStorage.findUniqueOrThrow({
            where: { id: workspace.storageId },
            include: { account: { include: { region: { include: { cloudProvider: true } } } } },
        });
        const accountNetwork = yield prisma.accountNetwork.findUniqueOrThrow({
            where: { id: workspace.networkId },
            include: { account: { include: { region: { include: { cloudProvider: true } } } } },
        });
        logger_1.default.debug({ accountNetwork, accountStorage });
        // Check Tshirt Size
        const clusterTshirtSize = yield ClusterTshirtSizeService.checkClusterTshirtSizeExists(data.clusterTshirtSizeUid);
        // TODO:
        // Check for quota. Fail the request if quota policy not allowing.
        // Might be on different service code
        // and called on route before calling createCluster
        // Start a transaction to ensure all operations succeed or fail together
        const result = yield prisma.$transaction((transactionPrisma) => __awaiter(this, void 0, void 0, function* () {
            // 1. Create the cluster object
            const cluster = yield transactionPrisma.cluster.create({
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
            const provisionConfig = yield generateClusterProvisionConfig({
                op: 'CREATE',
                providerName: accountStorage.account.region.cloudProvider.name,
                isFreeTier: data.account.plan === 'FREE',
                accountStorage,
                accountNetwork,
                clusterUid: cluster.uid,
                clusterTshirtSize,
            });
            const clusterConfig = yield transactionPrisma.clusterConfig.create({
                data: {
                    clusterId: cluster.id,
                    version: 1,
                    clusterTshirtSizeId: clusterTshirtSize.id,
                    provisionConfig: provisionConfig,
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
            yield transactionPrisma.cluster.update({
                where: { id: cluster.id },
                data: { currentConfigId: clusterConfig.id },
            });
            // 4. Create service config object
            // 5. Create service instance objects
            const serviceVersionUids = data.serviceSelections.map((sel) => sel.serviceVersionUid);
            const versionData = yield prisma.serviceVersion.findMany({
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
                yield transactionPrisma.serviceInstance.create({
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
            const workflowId = (0, clusterWorkflow_service_1.startClusterWorkflow)('CREATE', provisionConfig);
            logger_1.default.info('workflowId', workflowId);
            const result = yield transactionPrisma.cluster.findUnique({
                where: { uid: cluster.uid },
                select: cluster_select_1.createClusterResultSelect,
            });
            return result;
        }));
        return result;
    });
}
function generateClusterProvisionConfig(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Parse storage config & validate schema
        const storageConfigParsed = account_type_1.accountStorageConfigSchema.safeParse(data.accountStorage.storageConfig);
        if (!storageConfigParsed.data) {
            throw {
                status: 500,
                message: 'Failed to parse storageConfig',
            };
        }
        // Parse network config & validate schema
        const networkConfigParsed = account_type_1.awsAccountNetworkConfigSchema.safeParse(data.accountNetwork.networkConfig);
        if (!networkConfigParsed.data) {
            throw {
                status: 500,
                message: 'Failed to parse networkConfig',
            };
        }
        let provisionConfig = {};
        const tofuTemplateDir = config_1.default.tofu.tofuTemplateDir;
        switch (data.providerName) {
            case 'AWS':
                if (data.isFreeTier) {
                    provisionConfig = {
                        clusterUid: data.clusterUid,
                        tofuBackendConfig: storageConfigParsed.data.tofuBackend,
                        tofuTemplateDir,
                        tofuTemplatePath: 'aws/aws-tenant-free-tier',
                        tofuTfvars: {
                            region: config_1.default.provisioningFreeTierAWS.defaultRegion,
                            shared_subnet_ids: networkConfigParsed.data.config.subnetIds,
                            shared_eks_cluster_name: config_1.default.provisioningFreeTierAWS.eks_cluster_name,
                            shared_bucket_name: config_1.default.provisioningFreeTierAWS.s3Bucket,
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
        logger_1.default.debug({ provisionConfig }, 'Generated provisionConfig');
        return provisionConfig;
    });
}
/******************************************************************************
 * List accessible clusters
 *****************************************************************************/
function listCluster(_a) {
    return __awaiter(this, arguments, void 0, function* ({ name, description, workspaceUid, status, page = 1, limit = 10, }) {
        const whereClause = {};
        whereClause.workspaceUid = workspaceUid;
        if (name) {
            whereClause.name = {
                contains: name,
                mode: 'insensitive',
            };
        }
        if (description) {
            whereClause.description = {
                contains: description,
                mode: 'insensitive',
            };
        }
        if (status) {
            whereClause.status = status;
        }
        const [totalData, clusters] = yield Promise.all([
            prisma.cluster.count({ where: whereClause }),
            prisma.cluster.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (0, api_1.offsetPagination)(page, limit),
                take: limit,
                select: cluster_select_1.detailClusterSelect,
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
    });
}
/******************************************************************************
 * Describe a cluster
 *****************************************************************************/
function describeCluster(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const cluster = yield prisma.cluster.findUnique({
            where: { uid },
            select: cluster_select_1.detailClusterSelect,
        });
        if (!cluster) {
            throw {
                status: 404,
                message: 'Cluster not found',
            };
        }
        return cluster;
    });
}
/******************************************************************************
 * Update a cluster
 *****************************************************************************/
function updateCluster(uid, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingCluster = yield prisma.cluster.findUnique({
            where: { uid },
        });
        if (!existingCluster) {
            throw {
                status: 404,
                message: 'Cluster not found',
            };
        }
        const updatedCluster = yield prisma.cluster.update({
            where: { uid },
            data: data,
            select: cluster_select_1.detailClusterSelect,
        });
        return updatedCluster;
    });
}
/******************************************************************************
 * Delete a cluster
 *****************************************************************************/
function deleteCluster(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingCluster = yield prisma.cluster.findUnique({
            where: { uid },
            select: cluster_select_1.deletedClusterSelect,
        });
        if (!existingCluster) {
            throw {
                status: 404,
                message: 'Cluster not found',
            };
        }
        const clusterConfig = yield prisma.clusterConfig.findUnique({
            where: { id: existingCluster.currentConfigId },
        });
        if (!clusterConfig) {
            throw {
                status: 404,
                message: 'Cluster found with no config',
            };
        }
        const deletedCluster = yield prisma.cluster.update({
            where: { uid },
            data: {
                status: 'DELETING',
            },
            select: cluster_select_1.detailClusterSelect,
        });
        // Parse storage config & validate schema
        const provisionConfigParsed = clusterProvisioning_type_1.clusterProvisionConfigSchema.safeParse(clusterConfig.provisionConfig);
        if (!provisionConfigParsed.data) {
            throw {
                status: 500,
                message: 'Failed to parse provisionConfig',
            };
        }
        if (deletedCluster.status === 'DELETING') {
            const workflowId = (0, clusterWorkflow_service_1.startClusterWorkflow)('DELETE', provisionConfigParsed.data);
            logger_1.default.debug({ workflowId });
        }
        return deletedCluster;
    });
}
