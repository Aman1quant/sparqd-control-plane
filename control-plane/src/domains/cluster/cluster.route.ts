// import { ClusterStatus } from '@prisma/client';
// import { Request, Response, Router } from 'express';

// import logger from '@/config/logger';
// import * as ClusterService from '@/domains/cluster/cluster.service';
// import clusterValidator from '@/domains/cluster/cluster.validator';
// import { createErrorResponse, createSuccessResponse } from '@/utils/api';
// import { resultValidator } from '@/validator/result.validator';

// const clusterRoute = Router();

// /******************************************************************************
//  * Create a cluster
//  *****************************************************************************/
// clusterRoute.post('/', clusterValidator.createCluster, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { name, description, clusterTshirtSizeUid, serviceSelections } = req.body;

//     const result = await ClusterService.createCluster({
//       name,
//       description,
//       workspace: req.workspace,
//       account: req.account,
//       userId: req.user.id,
//       clusterTshirtSizeUid,
//       serviceSelections,
//     });

//     // Return the complete result with cluster, config, and automation job
//     res.status(201).json(createSuccessResponse(result));
//   } catch (err: unknown) {
//     logger.error({ err }, 'Create cluster failed');
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });

// /******************************************************************************
//  * List all clusters accessible for a user
//  *****************************************************************************/
// clusterRoute.get('/', clusterValidator.listClusters, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { name, description, status, page = 1, limit = 10 } = req.query;

//     const filters = {
//       name: name as string,
//       description: description as string,
//       workspaceId: req.workspaceUid,
//       status: status as ClusterStatus,
//       page: parseInt(page as string) || 1,
//       limit: parseInt(limit as string) || 10,
//     };

//     const result = await ClusterService.listCluster(filters);
//     res.status(200).json(createSuccessResponse(result));
//   } catch (err: unknown) {
//     logger.error(err);
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });

// /******************************************************************************
//  * Update a cluster
//  *****************************************************************************/
// clusterRoute.put('/:uid', clusterValidator.updateCluster, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { clusterUid } = req.params;
//     const { name, description, status } = req.body;

//     const cluster = await ClusterService.updateCluster(clusterUid, {
//       name,
//       description,
//       status,
//     });
//     res.status(200).json(createSuccessResponse(cluster));
//   } catch (err: unknown) {
//     logger.error(err);
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });

// /******************************************************************************
//  * Describe a cluster
//  *****************************************************************************/
// clusterRoute.get('/:uid', clusterValidator.getClusterDetail, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;
//     const cluster = await ClusterService.describeCluster(uid);

//     res.status(200).json(createSuccessResponse(cluster));
//   } catch (err: unknown) {
//     logger.error(err);
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });

// /******************************************************************************
//  * Delete a cluster
//  *****************************************************************************/
// clusterRoute.delete('/:uid', clusterValidator.deleteCluster, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;

//     const deletedCluster = await ClusterService.deleteCluster(uid);
//     res.status(200).json(createSuccessResponse(deletedCluster));
//   } catch (err: unknown) {
//     logger.error(err);
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });

// // Additional route for updating cluster status specifically
// clusterRoute.patch('/:uid/status', clusterValidator.updateClusterStatus, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;
//     const { status, statusReason } = req.body;

//     const clusterData = {
//       status,
//       ...(statusReason !== undefined && { statusReason }),
//     };

//     const cluster = await ClusterService.updateCluster(uid, clusterData);
//     res.status(200).json(createSuccessResponse(cluster));
//   } catch (err: unknown) {
//     logger.error(err);
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });

// clusterRoute.patch('/:uid/shutdown', clusterValidator.updateClusterStatus, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;
//     const { statusReason } = req.body;

//     const clusterData = {
//       status: 'STOPPED' as ClusterStatus,
//       ...(statusReason !== undefined && { statusReason }),
//     };

//     const cluster = await ClusterService.updateCluster(uid, clusterData);
//     res.status(200).json(createSuccessResponse(cluster));
//   } catch (err: unknown) {
//     logger.error(err);
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });

// export default clusterRoute;
