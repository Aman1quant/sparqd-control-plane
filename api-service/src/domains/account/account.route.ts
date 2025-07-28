import express, { Request, Response, Router } from 'express';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import logger from '@/config/logger';
import { createAccount, deleteAccount, detailAccount, editAccount, listAccount } from '@/domains/account/account.service';

export const accountRouter = express.Router();

accountRouter.get('/', async (req: Request, res: Response) => {
  const { name = '', page = 1, limit = 10 } = req.query;

  try {
    const accounts = await listAccount({ name: String(name), page: Number(page), limit: Number(limit) });

    res.status(200).json(createSuccessResponse(accounts));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

accountRouter.get('/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const account = await detailAccount(uid);
    res.status(200).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

accountRouter.post('/', async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const account = await createAccount({ name });
    res.status(201).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

accountRouter.put('/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { name } = req.body;

  try {
    const account = await editAccount(uid, { name });
    res.status(200).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

accountRouter.delete('/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const account = await deleteAccount(uid);
    res.status(200).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default accountRouter;
