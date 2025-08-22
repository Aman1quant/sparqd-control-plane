import { ClusterStatus, PrismaClient } from '@prisma/client';

import { copyTemplateToDir, createEphemeralDir, deleteEphemeralDir } from '../utils/file-system';
import logger from '../utils/logger';
import { runTofu, writeTfVarsJsonFile } from '../utils/tofu';
import { TofuBackendConfig } from './clusterProvisioning.type';

const prisma = new PrismaClient();

export async function updateClusterStatus(clusterUid: string, prevStatus: ClusterStatus, status: ClusterStatus, statusReason?: string): Promise<void> {
  // Update cluster table status
  const cluster = await prisma.cluster.update({
    where: { uid: clusterUid },
    data: {
      status: status,
      statusReason: statusReason,
    },
  });

  const clusterEvent = await prisma.clusterEvent.create({
    data: {
      clusterId: cluster.id,
      before: {
        status: prevStatus,
      },
      after: {
        status: status,
        statusReason: statusReason,
      },
    },
  });

  await prisma.cluster.update({ where: { id: cluster.id }, data: { latestEventId: clusterEvent.id } });

  logger.info(`Cluster ${clusterUid} state changed: ${prevStatus} --> ${status}`);
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

export async function createTofuDir(clusterUid: string) {
  logger.info(`Creating tofu ephemeral directory`);
  const dir = await createEphemeralDir(clusterUid);
  return dir;
}

export async function getTofuTemplate(tofuTemplateDir: string, tofuDir: string) {
  logger.info(`Copying tofu template from ${tofuTemplateDir} into ${tofuDir}`);
  await copyTemplateToDir(tofuTemplateDir, tofuDir);
  return tofuDir;
}

export async function prepareTfVarsJsonFile(tfVarsJsonData: any, workingDir: string) {
  const tfVarsJsonPath = await writeTfVarsJsonFile({
    tfVarsJsonData: tfVarsJsonData,
    outputPath: `${workingDir}/env.tfvars.json`,
  });
  logger.info(`TFVARS JSON successfully written to ${tfVarsJsonPath}`);
  return tfVarsJsonPath;
}

export async function tofuInit(workingDir: string, backendConfig: TofuBackendConfig) {
  logger.info(`Running tofu init in [${workingDir}]...`);

  let cmd: string;

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

  const out = await runTofu(cmd, workingDir);
  return out;
}

export async function tofuPlan(workingDir: string) {
  logger.info(`Running tofu plan...`);
  const out = await runTofu('tofu plan -var-file="env.tfvars.json" -out plan.tfout', workingDir);
  return out;
}

export async function tofuApply(workingDir: string) {
  logger.info(`Running tofu apply...`);
  const out = await runTofu('tofu apply -auto-approve plan.tfout', workingDir);
  return out;
}

export async function tofuDestroy(workingDir: string) {
  logger.info(`Running tofu destroy...`);
  const out = await runTofu('tofu destroy -var-file="env.tfvars.json" -auto-approve', workingDir);
  return out;
}

export async function cleanupTofuDir(tofuDir: string) {
  logger.info(`Cleaning up tofu ephemeral directory`);
  const dir = await deleteEphemeralDir(tofuDir);
  return dir;
}
