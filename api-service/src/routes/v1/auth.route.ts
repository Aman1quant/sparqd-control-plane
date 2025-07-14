import express, { Router } from 'express';
import { accountsForEmail, login, signup } from '@services/auth.service';
import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';

export const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
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

authRouter.post('/accounts-for-email', async (req, res) => {
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

authRouter.post('/login', async (req, res) => {
  const { email, password, accountUid } = req.body;

  try {
    const result = await login({ email, password, accountUid });
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
