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

  // let clusterAutomationJobStatus: AutomationJobStatus = 'pending';
  // if (status === 'CREATE_FAILED' || status === 'DELETE_FAILED' || status === 'STOP_FAILED' || status === 'UPDATE_FAILED') {
  //   clusterAutomationJobStatus = 'failed'
  // } else {
  //   if (status === 'RUNNING' || status === 'DELETED' || status === 'STOPPED') {
  //     clusterAutomationJobStatus = 'completed'
  //   } else {
  //     if (status === 'CREATING' || status === 'DELETING' || status === 'STOPPING' || status === 'UPDATING') {
  //       clusterAutomationJobStatus = 'running'
  //     }
  //   }
  // }

  // if (['failed', 'completed', 'running'].includes(clusterAutomationJobStatus)) {
  //   await prisma.clusterAutomationJob.up({
  //     where: {id: cluster.au},
  //     data: {
  //       status: clusterAutomationJobStatus
  //     }
  //   })
  // }

  await prisma.clusterAutomationJob.update;

  logger.info(`Cluster ${clusterUid} state changed: ${prevStatus} --> ${status}`);
}

export async function postDestroyCluster(clusterUid: string): Promise<void> {
  // Use transaction to delete cluster and all related data after physical deletion successful
  await prisma.$transaction(async (tx) => {
    const cluster = await tx.cluster.findUnique({ where: { uid: clusterUid } });
    if (!cluster) {
      throw new Error(`Cluster UID not found: ${clusterUid}`);
    }

    // // 1. Delete all cluster automation jobs first
    // await tx.clusterAutomationJob.deleteMany({
    //   where: { clusterId: cluster.id },
    // });

    // // 2. Delete all cluster configs
    // await tx.clusterConfig.deleteMany({
    //   where: { clusterId: cluster.id },
    // });

    // // 3. Delete service instances if any
    // await tx.serviceInstance.deleteMany({
    //   where: { clusterId: cluster.id },
    // });

    // // 4. Delete usage records if any
    // await tx.usage.deleteMany({
    //   where: { clusterId: cluster.id },
    // });

    // // 5. Delete billing records if any
    // await tx.billingRecord.deleteMany({
    //   where: { clusterId: cluster.id },
    // });

    // 6. Finally delete the cluster
    // const deletedCluster = await tx.cluster.delete({
    //   where: { uid: clusterUid },
    // });
    // Or marked as DELETED
    const deletedCluster = await tx.cluster.update({
      where: { uid: clusterUid },
      data: {
        status: 'DELETED',
      },
    });

    return deletedCluster;
  });
}

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
