"use strict";
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
exports.updateClusterStatus = updateClusterStatus;
exports.createTofuDir = createTofuDir;
exports.getTofuTemplate = getTofuTemplate;
exports.prepareTfVarsJsonFile = prepareTfVarsJsonFile;
exports.tofuInit = tofuInit;
exports.tofuPlan = tofuPlan;
exports.tofuApply = tofuApply;
exports.tofuDestroy = tofuDestroy;
exports.cleanupTofuDir = cleanupTofuDir;
const client_1 = require("@prisma/client");
const file_system_1 = require("../utils/file-system");
const logger_1 = __importDefault(require("../utils/logger"));
const tofu_1 = require("../utils/tofu");
const prisma = new client_1.PrismaClient();
function updateClusterStatus(clusterUid, prevStatus, status, statusReason) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.cluster.update({
            where: { uid: clusterUid },
            data: {
                status: status,
                statusReason: statusReason,
            },
        });
        logger_1.default.info(`Cluster ${clusterUid} state changed: ${prevStatus} --> ${status}`);
    });
}
// export async function postDestroyCluster(clusterUid: string, status: ClusterStatus, statusReason?: string): Promise<void> {
//   // Use transaction to delete cluster and all related data after physical deletion successful
//   const uid = clusterUid;
//   const result = await prisma.$transaction(async (transactionPrisma) => {
//     // 1. Delete all cluster automation jobs first
//     await transactionPrisma.clusterAutomationJob.deleteMany({
//       where: { uid },
//     });
//     // 2. Delete all cluster configs
//     await transactionPrisma.clusterConfig.deleteMany({
//       where: { uid },
//     });
//     // 3. Delete service instances if any
//     await transactionPrisma.serviceInstance.deleteMany({
//       where: { uid },
//     });
//     // 4. Delete usage records if any
//     await transactionPrisma.usage.deleteMany({
//       where: { uid },
//     });
//     // 5. Delete billing records if any
//     await transactionPrisma.billingRecord.deleteMany({
//       where: { uid },
//     });
//     // 6. Finally delete the cluster
//     const deletedCluster = await transactionPrisma.cluster.delete({
//       where: { uid },
//     });
//     return deletedCluster;
//   });
// }
function createTofuDir(clusterUid) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Creating tofu ephemeral directory`);
        const dir = yield (0, file_system_1.createEphemeralDir)(clusterUid);
        return dir;
    });
}
function getTofuTemplate(tofuTemplateDir, tofuDir) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Copying tofu template from ${tofuTemplateDir} into ${tofuDir}`);
        yield (0, file_system_1.copyTemplateToDir)(tofuTemplateDir, tofuDir);
        return tofuDir;
    });
}
function prepareTfVarsJsonFile(tfVarsJsonData, workingDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const tfVarsJsonPath = yield (0, tofu_1.writeTfVarsJsonFile)({
            tfVarsJsonData: tfVarsJsonData,
            outputPath: `${workingDir}/env.tfvars.json`,
        });
        logger_1.default.info(`TFVARS JSON successfully written to ${tfVarsJsonPath}`);
        return tfVarsJsonPath;
    });
}
function tofuInit(workingDir, backendConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Running tofu init in [${workingDir}]...`);
        let cmd;
        switch (backendConfig.type) {
            case 's3': {
                const { bucket, key, region } = backendConfig;
                cmd = `tofu init \
      -backend-config="bucket=${bucket}" \
      -backend-config="key=${key}/terraform.tfstate" \
      -backend-config="region=${region}" \
      -reconfigure`;
                break;
            }
            default: {
                throw new Error(`Unsupported tofu backend type: ${backendConfig.type}`);
            }
        }
        const out = yield (0, tofu_1.runTofu)(cmd, workingDir);
        return out;
    });
}
function tofuPlan(workingDir) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Running tofu plan...`);
        const out = yield (0, tofu_1.runTofu)('tofu plan -var-file="env.tfvars.json" -out plan.tfout', workingDir);
        return out;
    });
}
function tofuApply(workingDir) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Running tofu apply...`);
        const out = yield (0, tofu_1.runTofu)('tofu apply -auto-approve plan.tfout', workingDir);
        return out;
    });
}
function tofuDestroy(workingDir) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Running tofu destroy...`);
        const out = yield (0, tofu_1.runTofu)('tofu destroy -var-file="env.tfvars.json" -auto-approve', workingDir);
        return out;
    });
}
function cleanupTofuDir(tofuDir) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Cleaning up tofu ephemeral directory`);
        const dir = yield (0, file_system_1.deleteEphemeralDir)(tofuDir);
        return dir;
    });
}
