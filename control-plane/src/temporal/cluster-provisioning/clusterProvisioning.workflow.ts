import { ApplicationFailure, proxyActivities } from '@temporalio/workflow';
// import { sleep } from '@temporalio/workflow';
import type * as activities from './clusterProvisioning.activities';
import { ProvisionAWSClusterWorkflowInput } from '../types';
import logger from '../utils/logger';

const {
  createTofuDir,
  getTofuTemplate,
  updateClusterStatus,
  tofuInit,
  tofuPlan,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 hour',
  heartbeatTimeout: '30 seconds',
  retry: {
    maximumAttempts: 1,
    initialInterval: '5s',
    backoffCoefficient: 2,
    maximumInterval: '10s',
  },
});

export async function provisionAWSClusterWorkflow(input: ProvisionAWSClusterWorkflowInput): Promise<string> {

  // Create temporary Tofu working dir
  const tmpDir = await createTofuDir(input.clusterUid)
  if (!tmpDir) {
    throw ApplicationFailure.create({ message: "Failed creating temporary Tofu directory" })
  }

  // Copy Tofu template to tmpDir
  const copied = await getTofuTemplate(input.tofuTemplateDir || 'noexists', tmpDir)
  if (!copied) {
    throw ApplicationFailure.create({ message: "Failed getting Tofu template" })
  }

  // Check if required to provision EKS cluster or use free-tier cluster
  if (input.isFreeTier) {
    logger.info('Free-tier. Skipping EKS cluster creation');
  } else {
    logger.info('Will provisioning EKS cluster');
  }

  // Run tofu init
  const initOut = await tofuInit(`${tmpDir}/${input.tofuTemplatePath}`, input.s3BackendConfig)

  // Run tofu apply
  if (!initOut) {
    throw ApplicationFailure.create({ message: "Failed init Tofu" })
  }
  const applyOut = await tofuPlan(`${tmpDir}/${input.tofuTemplatePath}`)

  // await sleep('30 s');

  await updateClusterStatus(input.clusterUid, 'RUNNING');
  return 'ok';
}
