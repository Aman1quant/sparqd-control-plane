import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import { userSelect } from '@/models/selects/user.select';
import { getUserByKcSub } from '@/services/user.service';

const prisma = new PrismaClient();
const userRouter = express.Router();

userRouter.get('/me', async (req, res) => {

  try {
    const kcSub = req.user?.sub

    if (kcSub) {
      const user = await getUserByKcSub(kcSub)

      if (!user) {
        logger.info(`Creating new user: ${kcSub}`)
      }
    }
    else {
      return res.status(404).json({ error: 'User not found' });
    }

    // if (!user) {
    //   return res.status(404).json({ error: 'User not found' });
    // }

    // res.status(200).json(createSuccessResponse(user));
  } catch (err: any) {
    logger.error(err);
    const errorResponse = createErrorResponse(err);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
  res.json({});
});

export default (router: Router) => {
  router.use('/v1', userRouter);
};
