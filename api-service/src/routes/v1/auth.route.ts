import express, { Request, Response, Router } from 'express';
import { accountsForEmail, forgotPassword, signup } from '@services/auth.service';
import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import authValidator from '@/validator/auth.validator';
import { resultValidator } from '@/validator/result.validator';

export const authRouter = express.Router();

authRouter.post('/signup', async (req: Request, res: Response) => {
  const { accountName, email, password, fullName } = req.body;

  try {
    const result = await signup({ accountName, email, password, fullName });
    res.status(201).json(createSuccessResponse(result));
  } catch (err: any) {
    logger.error(err);
    const errorResponse = createErrorResponse(err);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

authRouter.post('/accounts-for-email', async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const accounts = await accountsForEmail({ email });
    res.status(200).json(createSuccessResponse(accounts));
  } catch (err: any) {
    logger.error(err);
    const errorResponse = createErrorResponse(err);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

authRouter.post('/forgot-password', authValidator.forgotPassword, resultValidator, async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await forgotPassword(email);

    res.status(200).json(createSuccessResponse(result));
  } catch (err: any) {
    logger.error(err);
    const errorResponse = createErrorResponse(err);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default (router: Router) => {
  router.use('/v1/auth', authRouter);
};
