import express, { Request, Response, Router } from 'express';
import { getUserByKcSub } from '@/services/user.service';
import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import { onboardNewUser } from '@/services/onboarding.service';
import { getRoleByName } from '@/services/role.service';

const onboardingRouter = express.Router();

onboardingRouter.post('/', async (req: Request, res: Response) => {
  try {
    const kcSub = req.kcUser?.sub;
    const email = req.kcUser?.email as string;
    const firstName = req.kcUser?.given_name || '';
    const lastName = req.kcUser?.family_name || '';
    const fullName = `${firstName} ${lastName}`;

    // Check of user exists in DB
    if (kcSub && email) {
      const user = await getUserByKcSub(kcSub);

      if (!user) {
        const accountAdminRole = await getRoleByName('AccountOwner');
        const result = await onboardNewUser({
          email: email as string,
          kcSub: kcSub,
          fullName: fullName,
          accountName: 'default',
          roleId: accountAdminRole?.id || 1,
        });

        return res.status(200).json(createSuccessResponse(result));
      }
      return res.status(200).json(createSuccessResponse(user));
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err: any) {
    logger.error(err);
    const errorResponse = createErrorResponse(err);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default (router: Router) => {
  router.use('/v1/onboarding', onboardingRouter);
};
