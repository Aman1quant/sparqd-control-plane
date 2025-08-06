import { proxyActivities } from '@temporalio/workflow';

import { OnboardNewUserInput } from '@/domains/onboarding/onboarding.service';

import type * as activities from '../activities/onboarding.activity';

const {
  // createDefaultWorkspace,
  // sendWelcomeEmail,
  createUserActivity,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: {
    maximumAttempts: 1,
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '10s',
  },
});

export async function onboardingWorkflow(input: OnboardNewUserInput): Promise<string> {
  // const workspaceId = await createDefaultWorkspace(input.kcSub);
  // await sendWelcomeEmail(input.kcSub);
  // return workspaceId;

  const user = await createUserActivity({
    email: input.email,
    kcSub: input.kcSub,
    fullName: input.fullName || '',
    avatarUrl: input.avatarUrl,
  });

  return 'ok';
}
