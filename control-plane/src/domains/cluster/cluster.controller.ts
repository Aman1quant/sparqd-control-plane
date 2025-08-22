import * as ClusterService from '@domains/cluster/cluster.service';
import * as express from 'express';
import { Body, Controller, Middlewares, Path, Post, Request, Response, Route, SuccessResponse, Tags } from 'tsoa';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional } from '@/middlewares/resolveTenantContext';

import { ValidateErrorJSON } from '../_shared/shared.controller';
import { Cluster, ClusterCreateRequest } from './cluster.type';

@Route('workspaces/{workspaceUid}/clusters')
@Tags('Clusters')
@Middlewares(authMiddleware, resolveTenantContextOptional)
export class ClusterController extends Controller {
  @Post('/')
  @SuccessResponse('201', 'Created')
  @Response<ValidateErrorJSON>(400, 'Validation Failed')
  public async createCluster(@Request() req: express.Request, @Path() workspaceUid: string, @Body() body: ClusterCreateRequest): Promise<Cluster> {
    const cluster = await ClusterService.createClusterTx({
      name: body.name,
      description: body.description,
      accountUid: body.accountUid,
      workspaceUid: workspaceUid,
      clusterTshirtSizeUid: body.clusterTshirtSizeUid,
      serviceSelections: body.serviceSelections,
      userId: req.user.id,
    });
    return cluster;
  }
}
