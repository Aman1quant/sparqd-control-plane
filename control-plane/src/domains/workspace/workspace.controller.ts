import { PrismaClient } from '@prisma/client';
import * as express from 'express';
import { Body, Controller, Delete, Get, Middlewares, Patch, Path, Post, Query, Request, Response, Route, SuccessResponse, Tags } from 'tsoa';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextRequired } from '@/middlewares/resolveTenantContext';

import { ValidateErrorJSON } from '../_shared/shared.controller';
import * as WorkspaceService from './workspace.service';
import { PartialWorkspacePatchInput, Workspace, WorkspaceCreateInput, WorkspaceList } from './workspace.type';

@Route('workspaces')
@Tags('Workspaces')
@Middlewares(authMiddleware, resolveTenantContextRequired)
export class WorkspaceController extends Controller {
  @Get('/')
  @SuccessResponse(200)
  public async listWorkspaces(
    @Request() req: express.Request,
    @Query() name?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
  ): Promise<WorkspaceList> {
    const result = await WorkspaceService.listWorkspaces({
      userId: req.user.id,
      name: name || '',
      page: page || 1,
      limit: limit || 10,
    });
    return {
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('/{uid}')
  public async getWorkspace(@Request() req: express.Request, @Path() uid: string): Promise<Workspace | null> {
    const result = await WorkspaceService.getWorkspace(uid, req.user.id);
    return result;
  }

  @Post('/')
  @SuccessResponse('201', 'Created')
  @Response<ValidateErrorJSON>(400, 'Validation Failed')
  public async createWorkspace(@Request() req: express.Request, @Body() body: WorkspaceCreateInput): Promise<Workspace> {
    const prisma = new PrismaClient();
    const workspace = await prisma.$transaction(async (tx) => {
      return await WorkspaceService.createWorkspaceTx(tx, {
        name: body.name,
        description: body.description,
        createdById: req.user.id as unknown as bigint,
        accountUid: body.accountUid,
        accountNetworkUid: body.accountNetworkUid,
        accountStorageUid: body.accountStorageUid,
      });
    });
    return workspace;
  }

  @Patch('/{uid}')
  public async patchWorkspace(@Request() req: express.Request, @Path() uid: string, @Body() body: PartialWorkspacePatchInput): Promise<Workspace> {
    return await WorkspaceService.patchWorkspace(uid, req.user.id, body);
  }

  @Delete('/{uid}')
  public async deleteWorkspace(@Request() req: express.Request, @Path() uid: string): Promise<Workspace> {
    const prisma = new PrismaClient();
    const workspace = await prisma.$transaction(async (tx) => {
      return await WorkspaceService.deleteWorkspaceTx(tx, uid, req.user.id);
    });
    return workspace;
  }
}
