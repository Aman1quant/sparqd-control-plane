import * as AccountService from '@domains/account/account.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';

export const accountRouter = Router();

/******************************************************************************
 * Get all accounts
 * Always filtered by userId
 *****************************************************************************/
accountRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { name = '', page = 1, limit = 10 } = req.query;

    const accounts = await AccountService.listAccount({
      userId: req.user.id,
      name: String(name),
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    });
    res.status(200).json(createSuccessResponse(accounts));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/******************************************************************************
 * Get an account
 *****************************************************************************/
accountRouter.get('/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const account = await AccountService.describeAccount(uid);
    res.status(200).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/******************************************************************************
 * Create an account
 *****************************************************************************/
accountRouter.post('/', async (req: Request, res: Response) => {
  const { name, region, plan, networkConfig, storageConfig } = req.body;

  try {
    const prisma = new PrismaClient();
    const account = await prisma.$transaction(async (tx) => {
      return await AccountService.createAccountTx(tx, {
        name,
        region: region,
        user: req.user,
        networkConfig,
        storageConfig,
        isDefault: false,
      });
    });

    res.status(201).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/******************************************************************************
 * Modify an account
 *****************************************************************************/
accountRouter.put('/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { name } = req.body;

  try {
    const account = await AccountService.editAccount(uid, { name });
    res.status(200).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/******************************************************************************
 * Delete an account
 *****************************************************************************/
accountRouter.delete('/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const account = await AccountService.deleteAccount(uid);
    res.status(200).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default accountRouter;
