import { WorkflowHandle } from '@temporalio/client';

import { connectTemporalClient } from '@/config/clients/temporal.client';
import { ClusterProvisionConfig } from '@/workflow/clusterProvisioning/clusterProvisioning.type';
import { provisionClusterWorkflow } from '@/workflow/clusterProvisioning/clusterProvisioning.workflow';
import logger from '@/workflow/utils/logger';

/******************************************************************************
 * Start cluster workflow wrapper
 *****************************************************************************/
export async function startClusterWorkflow(arg: ClusterProvisionConfig): Promise<WorkflowHandle> {
  logger.debug({ arg }, "startClusterWorkflow Invoked")

  const temporalClient = await connectTemporalClient();

  const handle = await temporalClient.workflow.start(provisionClusterWorkflow, {
    args: [arg],
    taskQueue: 'clusterProvisioning',
    workflowId: `clusterProvisioning/${arg.clusterUid}/${Date.now()}`,
  });

  return handle;
}
