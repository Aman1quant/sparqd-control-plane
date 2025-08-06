import { WorkflowHandle } from '@temporalio/client';

import config from '@/config/config';
import { GenericClusterProvisionInput, StartClusterWorkflowArgs } from '@/models/workflow/generic-workflow.model';
import { provisionClusterWorkflow } from '@/temporal/cluster-provisioning/clusterProvisioning.workflow';
import { connectTemporalClient } from '@/temporal/temporal.client';

/******************************************************************************
 * Start cluster workflow wrapper
 *****************************************************************************/
export async function startClusterWorkflow({ op, cluster, overrides = {} }: StartClusterWorkflowArgs): Promise<WorkflowHandle> {
  const temporalClient = await connectTemporalClient();

  // switch (input.op) {}

  const defaultInput: GenericClusterProvisionInput = {
    op,
    tofuTemplateDir: '/home/tibrahim/clients/quant-data/sparqd-infra-master',
    tofuTemplatePath: 'aws/aws-tenant-free-tier',
    tofuTfvars: {
      region: 'ap-southeast-1',
      shared_subnet_ids: ['subnet-05bc434e6d875019e', 'subnet-0d6f8babc5227b967'],
      shared_eks_cluster_name: 'sparqd-cp-staging',
      tenant_node_instance_types: ['t3.small'],
      tenant_cluster_uid: cluster.uid,
      tenant_node_desired_size: 1,
      tenant_node_min_size: 1,
      tenant_node_max_size: 1,
    },
    tofuBackendConfig: {
      type: 's3',
      config: {
        bucket: config.provisioningSharedAWS.s3Bucket,
        key: `shared-clusters/${cluster.uid}`,
        region: 'ap-southeast-1',
      },
    },
    clusterUid: cluster.uid,
    isFreeTier: true,
  };

  const handle = await temporalClient.workflow.start(provisionClusterWorkflow, {
    args: [defaultInput],
    taskQueue: 'clusterProvisioning',
    workflowId: `clusterProvisioning/${cluster.uid}/${Date.now()}`,
  });

  return handle;
}
