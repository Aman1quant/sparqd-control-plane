import { resultValidator } from '@/validator/result.validator';
import { Request, Response, Router } from 'express';
import clusterTshirtSizeValidator from '@/domains/cluster/clusterTshirtSize.validator';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import logger from '@/config/logger';
import { listClusterTshirtSize } from '@domains/cluster/clusterTshirtSize.service';

const clusterTshirtSizeRoute = Router();

clusterTshirtSizeRoute.get('/', clusterTshirtSizeValidator.listclusterTshirtSizes, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, page = 1, limit = 10 } = req.query;
    const accountUid = req.cookies?.active_account;

    const filters = {
      name: name as string,
      description: description as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    };

    const result = await listClusterTshirtSize(filters);
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default clusterTshirtSizeRoute;
