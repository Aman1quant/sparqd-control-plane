import { Request, Response, Router } from 'express';

import logger from '@/config/logger';
import { onboardNewUser } from '@/domains/onboarding/onboarding.service';
import { getUserByKcSub } from '@/domains/user/user.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';

const onboardingRouter = Router();

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
        const result = await onboardNewUser({
          email: email as string,
          kcSub: kcSub,
          fullName: fullName,
          accountName: 'default',
        });

        return res.status(200).json(createSuccessResponse(result));
      }
      return res.status(200).json(createSuccessResponse(user));
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err: unknown) {
    logger.error({ err }, 'Onboarding failed');
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default onboardingRouter;
