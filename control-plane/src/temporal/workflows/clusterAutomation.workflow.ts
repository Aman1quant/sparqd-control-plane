import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/clusterAutomation.activity';

const {
  sendEmail,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: {
    maximumAttempts: 1,
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '10s',
  },
});

export async function provisionClusterWorkflow(input: any): Promise<string> {
  await sendEmail(input.kcSub);
  return 'ok';
}
