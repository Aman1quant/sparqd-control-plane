import { WorkflowHandle } from '@temporalio/client';

import { connectTemporalClient } from '@/config/clients/temporal.client';
import { ClusterProvisionConfig, ClusterWorkflowOp } from '@/workflow/clusterProvisioning/clusterProvisioning.type';
import { provisionClusterWorkflow } from '@/workflow/clusterProvisioning/clusterProvisioning.workflow';
import logger from '@/workflow/utils/logger';

/******************************************************************************
 * Start cluster workflow wrapper
 *****************************************************************************/
export async function startClusterWorkflow(op: ClusterWorkflowOp, arg: ClusterProvisionConfig): Promise<WorkflowHandle> {
  logger.debug({ arg }, 'startClusterWorkflow Invoked');

  const temporalClient = await connectTemporalClient();

  const handle = await temporalClient.workflow.start(provisionClusterWorkflow, {
    args: [op, arg],
    taskQueue: 'clusterProvisioning',
    workflowId: `clusterProvisioning/${op}/${arg.clusterUid}/${Date.now()}`,
  });

  return handle;
}
