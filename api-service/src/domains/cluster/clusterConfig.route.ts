import { Request, Response, Router } from 'express';
import logger from '@/config/logger';
import {
  createClusterConfig,
  deleteClusterConfig,
  listClusterConfig,
  updateClusterConfig,
  detailClusterConfig,
  setAsCurrentConfig,
  getClusterConfigsByCluster,
} from '@/domains/cluster/clusterConfig.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import clusterConfigValidator from '@/domains/cluster/clusterConfig.validator';
import { resultValidator } from '@/validator/result.validator';

const clusterConfigRoute = Router();

clusterConfigRoute.get('/', clusterConfigValidator.listClusterConfigs, resultValidator, async (req: Request, res: Response) => {
  try {
    const { clusterId, version, tshirtSize, createdById, page = 1, limit = 10 } = req.query;

    const filters = {
      clusterId: clusterId ? parseInt(clusterId as string) : undefined,
      version: version ? parseInt(version as string) : undefined,
      tshirtSize: tshirtSize as string,
      createdById: createdById ? parseInt(createdById as string) : undefined,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    };

    const result = await listClusterConfig(filters);
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterConfigRoute.post('/', clusterConfigValidator.createClusterConfig, resultValidator, async (req: Request, res: Response) => {
  try {
    const { clusterId, version, tshirtSize, services, rawSpec } = req.body;

    const createdById = req.user?.id;

    const clusterConfigData = {
      clusterId: parseInt(clusterId),
      version: parseInt(version),
      tshirtSize,
      services,
      rawSpec,
      ...(createdById && { createdById }),
    };

    const clusterConfig = await createClusterConfig(clusterConfigData);
    res.status(201).json(createSuccessResponse(clusterConfig));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterConfigRoute.put('/:uid', clusterConfigValidator.updateClusterConfig, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { version, tshirtSize, services, rawSpec } = req.body;

    const clusterConfigData = {
      ...(version !== undefined && { version: parseInt(version) }),
      ...(tshirtSize !== undefined && { tshirtSize }),
      ...(services !== undefined && { services }),
      ...(rawSpec !== undefined && { rawSpec }),
    };

    const clusterConfig = await updateClusterConfig(uid, clusterConfigData);
    res.status(200).json(createSuccessResponse(clusterConfig));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterConfigRoute.get('/:uid', clusterConfigValidator.getClusterConfigDetail, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const clusterConfig = await detailClusterConfig(uid);

    res.status(200).json(createSuccessResponse(clusterConfig));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

clusterConfigRoute.delete('/:uid', clusterConfigValidator.deleteClusterConfig, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    const deletedClusterConfig = await deleteClusterConfig(uid);
    res.status(200).json(createSuccessResponse(deletedClusterConfig));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

// Set cluster config as current
clusterConfigRoute.patch('/:uid/set-current', clusterConfigValidator.setAsCurrentConfig, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    const clusterConfig = await setAsCurrentConfig(uid);
    res.status(200).json(createSuccessResponse(clusterConfig));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

// Get all configs for a specific cluster
clusterConfigRoute.get('/cluster/:clusterUid', clusterConfigValidator.getClusterConfigsByCluster, resultValidator, async (req: Request, res: Response) => {
  try {
    const { clusterUid } = req.params;

    const clusterConfigs = await getClusterConfigsByCluster(clusterUid);
    res.status(200).json(createSuccessResponse(clusterConfigs));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default clusterConfigRoute;
