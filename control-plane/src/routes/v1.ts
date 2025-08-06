import { Router } from 'express';

import { accountRouter } from '@/domains/account/account.route';
import clusterRoute from '@/domains/cluster/cluster.route';
import clusterAutomationJobRoute from '@/domains/clusterAutomationJob/clusterAutomationJob.route';
import clusterConfigRoute from '@/domains/clusterConfig/clusterConfig.route';
import clusterTshirtSizeRoute from '@/domains/clusterTshirtSize/clusterTshirtSize.route';
import onboardingRouter from '@/domains/onboarding/onboarding.route';
import roleRouter from '@/domains/permission/role.route';
import serviceRoute from '@/domains/service/service.route';
import sessionRoute from '@/domains/session/session.route';
import userRouter from '@/domains/user/user.route';
import workspaceRoute from '@/domains/workspace/workspace.route';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional, resolveTenantContextRequired } from '@/middlewares/resolveTenantContext';
// import more routers...

const v1 = Router();

v1.use(authMiddleware);

v1.use('/onboarding', resolveTenantContextOptional, onboardingRouter);
v1.use('/account', resolveTenantContextOptional, accountRouter);
v1.use('/cluster', resolveTenantContextRequired, clusterRoute);
v1.use('/clusterAutomationJob', resolveTenantContextRequired, clusterAutomationJobRoute);
v1.use('/clusterConfig', resolveTenantContextRequired, clusterConfigRoute);
v1.use('/clusterTshirtSize', resolveTenantContextRequired, clusterTshirtSizeRoute);
v1.use('/role', resolveTenantContextOptional, roleRouter);
v1.use('/session', sessionRoute);
v1.use('/user', resolveTenantContextOptional, userRouter);
v1.use('/workspace', resolveTenantContextOptional, workspaceRoute);
v1.use('/services', resolveTenantContextRequired, serviceRoute);

export default v1;
