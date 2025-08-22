import { ClusterStatus } from '@prisma/client';
import { ApplicationFailure, proxyActivities } from '@temporalio/workflow';

import logger from '../utils/logger';
import type * as activities from './clusterProvisioning.activities';
import { ClusterProvisionConfig, ClusterWorkflowOp } from './clusterProvisioning.type';

const { createTofuDir, getTofuTemplate, prepareTfVarsJsonFile, updateClusterStatus, tofuInit, tofuPlan, tofuApply, tofuDestroy, cleanupTofuDir } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '1 hour',
    heartbeatTimeout: '30 seconds',
    retry: {
      maximumAttempts: 1,
      initialInterval: '5s',
      backoffCoefficient: 2,
      maximumInterval: '10s',
    },
  });

export async function provisionClusterWorkflow(op: ClusterWorkflowOp, input: ClusterProvisionConfig): Promise<string> {
  logger.info({ input }, 'provisionClusterWorkflow');

  let operationSucceeded = false;
  let initialState: ClusterStatus, progressingState: ClusterStatus, failedState: ClusterStatus, successState: ClusterStatus;
  switch (op) {
    case 'CREATE':
      initialState = 'PENDING';
      progressingState = 'CREATING';
      failedState = 'CREATE_FAILED';
      successState = 'RUNNING';
      break;
    case 'UPDATE':
      initialState = 'RUNNING';
      progressingState = 'UPDATING';
      failedState = 'UPDATE_FAILED';
      successState = 'RUNNING';
      break;
    case 'DELETE':
      initialState = 'RUNNING';
      progressingState = 'DELETING';
      failedState = 'DELETE_FAILED';
      successState = 'DELETED';
      break;
    default:
      throw ApplicationFailure.create({ message: 'Failed preparing provisionClusterWorkflow' });
  }

  // Initiate status from initialState --> progressingState
  await updateClusterStatus(input.clusterUid, initialState, progressingState);

  // Create temporary Tofu working dir
  const tmpDir = await createTofuDir(input.clusterUid);
  if (!tmpDir) {
    await updateClusterStatus(input.clusterUid, progressingState, failedState);
    throw ApplicationFailure.create({ message: 'Failed creating temporary Tofu directory' });
  }
  try {
    // Copy Tofu template to tmpDir
    const tofuDir = await getTofuTemplate(input.tofuTemplateDir || 'noexists', tmpDir);
    if (!tofuDir) {
      await updateClusterStatus(input.clusterUid, progressingState, failedState);
      throw ApplicationFailure.create({ message: 'Failed getting Tofu template' });
    } else {
      logger.info(`Tofu working directory: ${tofuDir}`);
    }

    // Final tofu working dir
    const tofuWorkingDir = `${tofuDir}/${input.tofuTemplatePath}`;

    // Write env.tfvars.json from input
    const tfVarsJsonPath = await prepareTfVarsJsonFile(input.tofuTfvars, tofuWorkingDir);
    if (!tfVarsJsonPath) {
      await updateClusterStatus(input.clusterUid, progressingState, failedState);
      throw ApplicationFailure.create({ message: 'Failed preparing env.tfvars.json' });
    }

    // Run tofu init
    const initOut = await tofuInit(tofuWorkingDir, input.tofuBackendConfig);
    if (!initOut) {
      await updateClusterStatus(input.clusterUid, progressingState, failedState);
      throw ApplicationFailure.create({ message: 'tofu init failed' });
    }

    // Business logic based on op
    switch (op) {
      case 'CREATE': {
        const planOut = await tofuPlan(tofuWorkingDir);
        if (!planOut) {
          await updateClusterStatus(input.clusterUid, progressingState, failedState);
          throw ApplicationFailure.create({ message: 'tofu plan failed' });
        }

        const applyOut = await tofuApply(tofuWorkingDir);
        if (!applyOut) {
          await updateClusterStatus(input.clusterUid, progressingState, failedState);
          throw ApplicationFailure.create({ message: 'tofu apply failed' });
        }

        await updateClusterStatus(input.clusterUid, progressingState, successState);
        operationSucceeded = true;
        break;
      }

      case 'DELETE': {
        const destroyOut = await tofuDestroy(tofuWorkingDir);
        if (!destroyOut) {
          await updateClusterStatus(input.clusterUid, progressingState, failedState);
          throw ApplicationFailure.create({ message: 'tofu destroy failed' });
        }

        await updateClusterStatus(input.clusterUid, progressingState, successState);

        operationSucceeded = true;
        break;
      }

      default: {
        await updateClusterStatus(input.clusterUid, progressingState, failedState);
        throw ApplicationFailure.create({
          message: `Unsupported operation: ${op}`,
        });
      }
    }
  } catch (error) {
    await updateClusterStatus(input.clusterUid, progressingState, failedState);
    throw ApplicationFailure.create({
      message: 'Unknown failure occurred',
      details: [error],
    });
  } finally {
    // Always cleanup ephemeral directory
    await cleanupTofuDir(tmpDir);
  }

  if (operationSucceeded) {
    return 'ok';
  }

  throw ApplicationFailure.create({
    message: 'Unknown failure occurred',
  });
}
