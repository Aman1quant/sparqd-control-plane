import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/clusterAutomation.activity';

const {
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

export async function provisionClusterWorkflow(input: any): Promise<string> {
  const workingDir = '/home/tibrahim/clients/quant-data/sparqd-control-plane/infra'
  await tofuInit(workingDir);
  await tofuPlan(workingDir);
  return 'ok';
}
