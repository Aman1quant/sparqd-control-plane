import express, { Router } from 'express';
import { PrismaClient } from '@prisma/app/generated/prisma/client';
import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import { userSelect } from '@/models/selects/user.select';

const prisma = new PrismaClient();
const userRouter = express.Router();

userRouter.get('/me', async (req, res) => {
  try {
    const userUid = 'fb5a945a-fa9e-45cf-82a3-c336f63f1c5a';

    const user = await prisma.user.findUnique({
      where: { uid: userUid },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(createSuccessResponse(user));
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
