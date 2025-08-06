import { AutomationJobStatus } from '@prisma/client';
import { Request, Response, Router } from 'express';

import logger from '@/config/logger';
import { listClusterAutomationJob } from '@/domains/clusterAutomationJob/clusterAutomationJob.service';
import clusterAutomationJobValidator from '@/domains/clusterAutomationJob/clusterAutomationJob.validator';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import { resultValidator } from '@/validator/result.validator';

const clusterAutomationJobRoute = Router();

clusterAutomationJobRoute.get('/', clusterAutomationJobValidator.listClusterAutomationJobs, resultValidator, async (req: Request, res: Response) => {
  try {
    const { clusterId, type, status, createdById, attempts, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    const filters = {
      clusterId: clusterId ? parseInt(clusterId as string) : undefined,
      type: type as string,
      status: status as AutomationJobStatus,
      createdById: createdById ? parseInt(createdById as string) : undefined,
      attempts: attempts ? parseInt(attempts as string) : undefined,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    };

    const result = await listClusterAutomationJob(filters);
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default clusterAutomationJobRoute;
