import express, { Request, Response, Router } from 'express';
import logger from '@/config/logger';
import { createCluster, deleteCluster, listCluster, updateCluster, detailCluster } from '@/services/cluster.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import clusterValidator from '@/validator/cluster.validator';
import { resultValidator } from '@/validator/result.validator';
import { ClusterStatus } from '@prisma/client';

const clusterRoute = express.Router();

clusterRoute.get('/', clusterValidator.listClusters, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, workspaceId, status, tshirtSize, createdById, page = 1, limit = 10 } = req.query;

    const filters = {
      name: name as string,
      description: description as string,
      workspaceId: workspaceId ? parseInt(workspaceId as string) : undefined,
      status: status as ClusterStatus,
      tshirtSize: tshirtSize as string,
      createdById: createdById ? parseInt(createdById as string) : undefined,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    };

    const result = await listCluster(filters);
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterRoute.post('/', clusterValidator.createCluster, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, workspaceId, tshirtSize, status, statusReason, metadata, createdById } = req.body;

    const clusterData = {
      name,
      description,
      workspaceId: parseInt(workspaceId),
      tshirtSize,
      ...(status !== undefined && { status }),
      ...(statusReason !== undefined && { statusReason }),
      ...(metadata !== undefined && { metadata }),
      ...(createdById && { createdById: parseInt(createdById) }),
    };

    const cluster = await createCluster(clusterData);
    res.status(201).json(createSuccessResponse(cluster));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterRoute.put('/:uid', clusterValidator.updateCluster, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { name, description, tshirtSize, status, statusReason, metadata } = req.body;

    const clusterData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(tshirtSize !== undefined && { tshirtSize }),
      ...(status !== undefined && { status }),
      ...(statusReason !== undefined && { statusReason }),
      ...(metadata !== undefined && { metadata }),
    };

    const cluster = await updateCluster(uid, clusterData);
    res.status(200).json(createSuccessResponse(cluster));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterRoute.get('/:uid', clusterValidator.getClusterDetail, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const cluster = await detailCluster(uid);

    res.status(200).json(createSuccessResponse(cluster));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterRoute.delete('/:uid', clusterValidator.deleteCluster, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    const deletedCluster = await deleteCluster(uid);
    res.status(200).json(createSuccessResponse(deletedCluster));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

// Additional route for updating cluster status specifically
clusterRoute.patch('/:uid/status', clusterValidator.updateClusterStatus, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { status, statusReason } = req.body;

    const clusterData = {
      status,
      ...(statusReason !== undefined && { statusReason }),
    };

    const cluster = await updateCluster(uid, clusterData);
    res.status(200).json(createSuccessResponse(cluster));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default (router: Router) => {
  router.use('/v1/cluster', clusterRoute);
};
