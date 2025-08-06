import { Request, Response, Router } from 'express';
import logger from '@/config/logger';
import { createCluster, deleteCluster, listCluster, updateCluster, detailCluster } from '@/domains/cluster/cluster.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import clusterValidator from '@/domains/cluster/cluster.validator';
import { resultValidator } from '@/validator/result.validator';
import { ClusterStatus } from '@prisma/client';

const clusterRoute = Router();

clusterRoute.get('/', clusterValidator.listClusters, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, status, page = 1, limit = 10 } = req.query;

    const filters = {
      name: name as string,
      description: description as string,
      workspaceId: req.workspaceUid,
      status: status as ClusterStatus,
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

/******************************************************************************
 * Create cluster
 *****************************************************************************/
clusterRoute.post('/', clusterValidator.createCluster, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, clusterTshirtSizeUid, serviceSelections } = req.body;

    const result = await createCluster({
      name,
      description,
      workspaceUid: req.workspaceUid,
      clusterTshirtSizeUid: clusterTshirtSizeUid,
      userId: req.user.id,
      serviceSelections,
    });

    // Return the complete result with cluster, config, and automation job
    res.status(201).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error({ err }, 'Create cluster failed');
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterRoute.put('/:uid', clusterValidator.updateCluster, resultValidator, async (req: Request, res: Response) => {
  try {
    const { clusterUid } = req.params;
    const { name, description, status } = req.body;

    const cluster = await updateCluster(clusterUid, {
      name,
      description,
      status,
    });
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

clusterRoute.patch('/:uid/shutdown', clusterValidator.updateClusterStatus, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { statusReason } = req.body;

    const clusterData = {
      status: 'STOPPED' as ClusterStatus,
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

export default clusterRoute;
