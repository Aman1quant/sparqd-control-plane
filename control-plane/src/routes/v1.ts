import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware';
import onboardingRouter from '@/domains/onboarding/onboarding.route';
import { accountRouter } from '@/domains/account/account.route';
import clusterRoute from '@/domains/cluster/cluster.route';
import clusterAutomationJobRoute from '@/domains/cluster/clusterAutomationJob.route';
import clusterConfigRoute from '@/domains/cluster/clusterConfig.route';
import roleRouter from '@/domains/permission/role.route';
import userRouter from '@/domains/user/user.route';
import workspaceRoute from '@/domains/workspace/workspace.route';
import serviceRoute from '@/domains/service/service.route';
import clusterTshirtSizeRoute from '@/domains/cluster/clusterTshirtSize.route';
import { resolveTenantContext } from '@/middlewares/resolveTenantContext';
import sessionRoute from '@/domains/session/session.route';
// import more routers...

const v1 = Router();

v1.use(authMiddleware);
v1.use(resolveTenantContext);

v1.use('/onboarding', onboardingRouter);
v1.use('/account', accountRouter);
v1.use('/cluster', clusterRoute);
v1.use('/clusterAutomationJob', clusterAutomationJobRoute);
v1.use('/clusterConfig', clusterConfigRoute);
v1.use('/clusterTshirtSize', clusterTshirtSizeRoute);
v1.use('/role', roleRouter);
v1.use('/session', sessionRoute);
v1.use('/user', userRouter);
v1.use('/workspace', workspaceRoute);
v1.use('/services', serviceRoute);

export default v1;
