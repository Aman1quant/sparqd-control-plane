import express, { Request, Response, Router } from 'express';
import logger from '@/config/logger';
import {
  createClusterAutomationJob,
  deleteClusterAutomationJob,
  listClusterAutomationJob,
  updateClusterAutomationJob,
  detailClusterAutomationJob,
} from '@/services/clusterAutomationJob.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import clusterAutomationJobValidator from '@/validator/clusterAutomationJob.validator';
import { resultValidator } from '@/validator/result.validator';
import { AutomationJobStatus } from '@prisma/client';

const clusterAutomationJobRoute = express.Router();

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

clusterAutomationJobRoute.post('/', clusterAutomationJobValidator.createClusterAutomationJob, resultValidator, async (req: Request, res: Response) => {
  try {
    const { clusterId, type, status, logsUrl, output, attempts, lastTriedAt, nextRetryAt, failReason } = req.body;

    const createdById = req.user?.id;

    const jobData = {
      clusterId: parseInt(clusterId),
      type,
      ...(status !== undefined && { status }),
      ...(logsUrl !== undefined && { logsUrl }),
      ...(output !== undefined && { output }),
      ...(attempts !== undefined && { attempts: parseInt(attempts) }),
      ...(lastTriedAt !== undefined && { lastTriedAt: new Date(lastTriedAt) }),
      ...(nextRetryAt !== undefined && { nextRetryAt: new Date(nextRetryAt) }),
      ...(failReason !== undefined && { failReason }),
      ...(createdById && { createdById }),
    };

    const job = await createClusterAutomationJob(jobData);
    res.status(201).json(createSuccessResponse(job));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterAutomationJobRoute.put('/:uid', clusterAutomationJobValidator.updateClusterAutomationJob, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { type, status, logsUrl, output, attempts, lastTriedAt, nextRetryAt, failReason } = req.body;

    const jobData = {
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(logsUrl !== undefined && { logsUrl }),
      ...(output !== undefined && { output }),
      ...(attempts !== undefined && { attempts: parseInt(attempts) }),
      ...(lastTriedAt !== undefined && { lastTriedAt: new Date(lastTriedAt) }),
      ...(nextRetryAt !== undefined && { nextRetryAt: new Date(nextRetryAt) }),
      ...(failReason !== undefined && { failReason }),
    };

    const job = await updateClusterAutomationJob(uid, jobData);
    res.status(200).json(createSuccessResponse(job));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterAutomationJobRoute.get('/:uid', clusterAutomationJobValidator.getClusterAutomationJobDetail, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const job = await detailClusterAutomationJob(uid);

    res.status(200).json(createSuccessResponse(job));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterAutomationJobRoute.delete('/:uid', clusterAutomationJobValidator.deleteClusterAutomationJob, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    const deletedJob = await deleteClusterAutomationJob(uid);
    res.status(200).json(createSuccessResponse(deletedJob));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default (router: Router) => {
  router.use('/v1/cluster-automation-job', clusterAutomationJobRoute);
};
