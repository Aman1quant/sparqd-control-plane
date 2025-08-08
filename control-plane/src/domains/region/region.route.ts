import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import { listCloudRegion } from './region.service';

export const cloudRegionRouter = Router();

/******************************************************************************
 * Get all cloud regions
 *****************************************************************************/
cloudRegionRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { name = '', page = 1, limit = 10 } = req.query;

    const accounts = await listCloudRegion({
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

export default cloudRegionRouter;