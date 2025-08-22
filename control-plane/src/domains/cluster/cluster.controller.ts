import * as ClusterService from '@domains/cluster/cluster.service';
import * as express from 'express';
import { Body, Controller, Delete, Get, Middlewares, Patch, Path, Post, Query, Request, Response, Route, SuccessResponse, Tags } from 'tsoa';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional } from '@/middlewares/resolveTenantContext';

import { ValidateErrorJSON } from '../_shared/shared.controller';
import { Cluster, ClusterList, CreateClusterRequest, PartialClusterPatchInput } from './cluster.type';

@Route('workspaces/{workspaceUid}/clusters')
@Tags('Clusters')
@Middlewares(authMiddleware, resolveTenantContextOptional)
export class ClusterController extends Controller {
  @Get('/')
  @SuccessResponse(200)
  public async listClusters(
    @Request() req: express.Request,
    @Query() name?: string,
    @Query() workspaceName?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
  ): Promise<ClusterList> {
    const result = await ClusterService.listClusters({
      userId: req.user.id,
      name: name || '',
      workspaceName: workspaceName || '',
      page: page || 1,
      limit: limit || 10,
    });
    return {
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('/{uid}')
  public async getCluster(@Request() req: express.Request, @Path() uid: string): Promise<Cluster | null> {
    const result = await ClusterService.getCluster(uid, req.user.id);
    return result;
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  @Response<ValidateErrorJSON>(400, 'Validation Failed')
  public async createCluster(@Request() req: express.Request, @Path() workspaceUid: string, @Body() body: CreateClusterRequest): Promise<Cluster> {
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

  @Patch('/{uid}')
  public async patchCluster(@Request() req: express.Request, @Path() uid: string, @Body() body: PartialClusterPatchInput): Promise<Cluster> {
    return await ClusterService.patchCluster(uid, req.user.id, body);
  }

  @Delete('/{uid}')
  public async deleteCluster(@Request() req: express.Request, @Path() uid: string): Promise<Cluster> {
    return await ClusterService.deleteCluster(uid, req.user.id);
  }
}
