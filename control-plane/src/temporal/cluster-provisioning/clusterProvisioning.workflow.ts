import { ApplicationFailure, proxyActivities } from '@temporalio/workflow';
import type * as activities from './clusterProvisioning.activities';
import logger from '../utils/logger';
import { GenericClusterProvisionInput } from '../../models/workflow/generic-workflow.model';

const {
  createTofuDir,
  getTofuTemplate,
  prepareTfVarsJsonFile,
  updateClusterStatus,
  tofuInit,
  tofuPlan,
  tofuApply,
  tofuDestroy,
  cleanupTofuDir,
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

export async function provisionClusterWorkflow(input: GenericClusterProvisionInput): Promise<string> {

  // Initiate status PENDING->CREATING
  await updateClusterStatus(input.clusterUid, 'CREATING');

  // Create temporary Tofu working dir
  const tmpDir = await createTofuDir(input.clusterUid)
  if (!tmpDir) {
    await updateClusterStatus(input.clusterUid, 'CREATE_FAILED');
    throw ApplicationFailure.create({ message: "Failed creating temporary Tofu directory" })
  }

  // Copy Tofu template to tmpDir
  const tofuDir = await getTofuTemplate(input.tofuTemplateDir || 'noexists', tmpDir)
  if (!tofuDir) {
    await updateClusterStatus(input.clusterUid, 'CREATE_FAILED');
    throw ApplicationFailure.create({ message: "Failed getting Tofu template" })
  } else {
    logger.info(`Tofu working directory: ${tofuDir}`)
  }

  // Final tofu working dir
  const tofuWorkingDir = `${tofuDir}/${input.tofuTemplatePath}`;

  // Check if required to provision EKS cluster or use free-tier cluster
  if (input.op && input.isFreeTier) {
    logger.info('Free-tier. Skipping EKS cluster creation');
  } else {
    logger.info('Will provisioning EKS cluster');
  }

  // Write env.tfvars.json from input
  const tfVarsJsonPath = await prepareTfVarsJsonFile(input.tofuTfvars, tofuWorkingDir)
  if (!tfVarsJsonPath) {
    await updateClusterStatus(input.clusterUid, 'CREATE_FAILED');
    throw ApplicationFailure.create({ message: "Failed preparing env.tfvars.json" })
  }

  // Run tofu init
  const initOut = await tofuInit(tofuWorkingDir, input.tofuBackendConfig)
  if (!initOut) {
    await updateClusterStatus(input.clusterUid, 'CREATE_FAILED');
    throw ApplicationFailure.create({ message: "tofu init failed" })
  }

  // Business logic based on input.op
  let operationSucceeded = false;
  switch (input.op) {
    case 'create': {
      const planOut = await tofuPlan(tofuWorkingDir);
      if (!planOut) {
        await updateClusterStatus(input.clusterUid, 'CREATE_FAILED');
        throw ApplicationFailure.create({ message: 'tofu plan failed' });
      }

      const applyOut = await tofuApply(tofuWorkingDir);
      if (!applyOut) {
        await updateClusterStatus(input.clusterUid, 'CREATE_FAILED');
        throw ApplicationFailure.create({ message: 'tofu apply failed' });
      }

      await updateClusterStatus(input.clusterUid, 'RUNNING');
      operationSucceeded = true;
      break;
    }

    case 'delete': {
      await updateClusterStatus(input.clusterUid, 'DELETING');

      const destroyOut = await tofuDestroy(tofuWorkingDir);
      if (!destroyOut) {
        await updateClusterStatus(input.clusterUid, 'DELETE_FAILED');
        throw ApplicationFailure.create({ message: 'tofu destroy failed' });
      }

      operationSucceeded = true;
      break;
    }

    default: {
      throw ApplicationFailure.create({
        message: `Unsupported operation: ${input.op}`,
      });
    }
  }

  // Always cleanup
  await cleanupTofuDir(tmpDir);

  if (operationSucceeded) {
    return 'ok';
  }

  throw ApplicationFailure.create({ message: 'Unknown failure occurred' });
}
