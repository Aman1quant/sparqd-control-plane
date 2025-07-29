import { Request, Response, Router } from 'express';
import logger from '@/config/logger';
import { createCluster, deleteCluster, listCluster, updateCluster, detailCluster, CreateClusterData } from '@/domains/cluster/cluster.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import clusterValidator from '@/domains/cluster/cluster.validator';
import { resultValidator } from '@/validator/result.validator';
import { ClusterStatus } from '@prisma/client';

const clusterRoute = Router();

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
    const {
      name,
      description,
      workspaceId,
      tshirtSize,
      status,
      statusReason,
      metadata,
      // Fields for cluster config
      configVersion,
      services,
      rawSpec,
      // Field for automation job
      initialJobType,
    } = req.body;

    const createdById = req.user?.id;

    const clusterData: CreateClusterData = {
      name,
      description,
      workspaceId: parseInt(workspaceId),
      tshirtSize,
      ...(status !== undefined && { status }),
      ...(statusReason !== undefined && { statusReason }),
      ...(metadata !== undefined && { metadata }),
      ...(createdById && { createdById }),
      // Optional fields for cluster config
      ...(configVersion !== undefined && { configVersion: parseInt(configVersion) }),
      ...(services !== undefined && { services }),
      ...(rawSpec !== undefined && { rawSpec }),
      // Optional field for automation job
      ...(initialJobType !== undefined && { initialJobType }),
    };

    const result = await createCluster(clusterData);

    // Return the complete result with cluster, config, and automation job
    res.status(201).json(
      createSuccessResponse({
        message: 'Cluster created successfully with config and automation job',
        cluster: result.cluster,
        clusterConfig: result.clusterConfig,
        automationJob: result.automationJob,
      }),
    );
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
