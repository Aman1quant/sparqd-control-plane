import { WorkflowHandle } from '@temporalio/client';

import config from '@/config/config';


import { connectTemporalClient } from '@/temporal/temporal.client';
import { GenericClusterProvisionInput, StartClusterWorkflowArgs } from '@/workflow/clusterProvisioning/clusterProvisioning.type';
import { provisionClusterWorkflow } from '@/workflow/clusterProvisioning/clusterProvisioning.workflow';

/******************************************************************************
 * Start cluster workflow wrapper
 *****************************************************************************/
export async function startClusterWorkflow({
  op,
  clusterUid,
  isFreeTier = false,
  provisionConfig,
  dummy = false,
}: StartClusterWorkflowArgs): Promise<WorkflowHandle> {
  const temporalClient = await connectTemporalClient();
  let workflowInput: GenericClusterProvisionInput;

  switch (provisionConfig.type) {
    case 'aws':
      workflowInput = {
        ...provisionConfig,
        op,
        clusterUid,
        dummy,
        isFreeTier,
        tofuTemplateDir: provisionConfig.tofuTemplateDir ?? '/home/tibrahim/clients/quant-data/sparqd-infra-master',
        tofuTemplatePath: provisionConfig.tofuTemplatePath ?? 'aws/aws-tenant-free-tier',
        tofuBackendConfig: {
          type: 's3',
          config: {
            bucket: config.provisioningSharedAWS.s3Bucket,
            key: `shared-clusters/${clusterUid}`,
            region: 'ap-southeast-1',
          },
        },
        tofuTfvars: {
          ...provisionConfig.tofuTfvars,
          region: 'ap-southeast-1',
          shared_subnet_ids: [
            'subnet-05bc434e6d875019e',
            'subnet-0d6f8babc5227b967',
          ],
          shared_eks_cluster_name: 'sparqd-cp-staging',
        },
      };
      break;
    default:
      throw new Error(
        `Unsupported cloud provider: ${(provisionConfig as any).type}`,
      );
  }

  // TODO: switch (input.op) {}

  // const defaultInput: AwsClusterProvisionConfig = {
  //   op,
  //   tofuTemplateDir: '/home/tibrahim/clients/quant-data/sparqd-infra-master',
  //   tofuTemplatePath: 'aws/aws-tenant-free-tier',
  //   tofuTfvars: {
  //     region: 'ap-southeast-1',
  //     shared_subnet_ids: ['subnet-05bc434e6d875019e', 'subnet-0d6f8babc5227b967'],
  //     shared_eks_cluster_name: 'sparqd-cp-staging',
  //     tenant_node_instance_types: ['t3.small'],
  //     tenant_cluster_uid: provisionConfig.clusterUid,
  //     tenant_node_desired_size: 1,
  //     tenant_node_min_size: 1,
  //     tenant_node_max_size: 1,
  //   },
  //   tofuBackendConfig: {
  //     type: 's3',
  //     config: {
  //       bucket: config.provisioningSharedAWS.s3Bucket,
  //       key: `shared-clusters/${provisionConfig.clusterUid}`,
  //       region: 'ap-southeast-1',
  //     },
  //   },
  //   clusterUid: 'cluster.uid',
  //   isFreeTier: true,
  // };

  let handle;
  switch (op) {
    case 'CREATE':
      handle = await temporalClient.workflow.start(provisionClusterWorkflow, {
        args: [workflowInput],
        taskQueue: 'clusterProvisioning',
        workflowId: `clusterProvisioning/${clusterUid}/${Date.now()}`,
      });
      break;

    default:
      throw new Error(
        `Unsupported operation op: ${(op as any).type}`,
      );
  }

  return handle;
}
