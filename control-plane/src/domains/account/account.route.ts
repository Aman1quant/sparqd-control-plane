import { Request, Response, Router } from 'express';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import logger from '@/config/logger';
import { createAccount, deleteAccount, detailAccount, editAccount, listAccount } from '@/domains/account/account.service';

export const accountRouter = Router();

/******************************************************************************
 * Get all accounts
 * Always filtered by userId
 *****************************************************************************/
accountRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { name = '', page = 1, limit = 10 } = req.query;

    const accounts = await listAccount({
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
    const account = await detailAccount(uid);
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
  const { name, plan } = req.body;

  try {
    const account = await createAccount({ name, plan: plan || 'FREE' });
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
    const account = await editAccount(uid, { name });
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
    const account = await deleteAccount(uid);
    res.status(200).json(createSuccessResponse(account));
  } catch (err) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default accountRouter;
