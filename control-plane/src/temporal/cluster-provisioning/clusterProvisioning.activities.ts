import { copyTemplateToDir, createEphemeralDir } from '../utils/file-system';
import { ClusterStatus, PrismaClient } from '@prisma/client';
import { runTofu } from '../utils/tofu';
import { S3BackendConfig } from '../types';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export async function updateClusterStatus(clusterUid: string, status: ClusterStatus, statusReason?: string): Promise<void> {
 await prisma.cluster.update({
    where: { uid: clusterUid },
    data: {
      status: status,
      statusReason: statusReason,
    },
  });
}

export async function createTofuDir(clusterUid: string) {
  logger.info(`Creating tofu ephemeral directory`)
  const dir = await createEphemeralDir(clusterUid)
  return dir
}

export async function getTofuTemplate(tofuTemplateDir: string, tofuDir: string) {
  logger.info(`Copying tofu template from ${tofuTemplateDir} into ${tofuDir}`)
  await copyTemplateToDir(tofuTemplateDir, tofuDir)
  return tofuDir;
}

export async function tofuInit(workingDir: string, backendConfig: S3BackendConfig) {
  logger.info(`Running tofu init...`)
  const cmd = `tofu init \
  -backend-config="bucket=${backendConfig.bucket}" \
  -backend-config="key=${backendConfig.key}/terraform.tfstate" \
  -backend-config="region=${backendConfig.region}" \
  -backend-config="encrypt=true" \
  -reconfigure`

  const out = await runTofu(cmd, workingDir)
  return out
}

export async function tofuPlan(workingDir: string) {
  logger.info(`Running tofu plan...`)
  const out = await runTofu('tofu plan', workingDir)
  return out
}
