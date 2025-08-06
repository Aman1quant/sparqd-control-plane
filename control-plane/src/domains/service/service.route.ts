import { Request, Response, Router } from 'express';
import logger from '@/config/logger';
import serviceValidator from './service.validator';
import { resultValidator } from '@/validator/result.validator';
import { getAvailableServices } from './service.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';

const serviceRoute = Router();

serviceRoute.get('/', serviceValidator.getAvailableServices, resultValidator, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAvailableServices({
      plan: req.account.plan,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    });
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default serviceRoute;
