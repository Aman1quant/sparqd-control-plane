import * as express from 'express';
import { Controller, Get, Middlewares, Path, Query, Request, Route, Tags } from 'tsoa';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional } from '@/middlewares/resolveTenantContext';

import * as AccountNetworkService from './accountNetwork.service';
import { AccountNetworkList } from './accountNetwork.type';

@Route('accounts/{accountUid}/networks')
@Tags('Account Networks')
@Middlewares(authMiddleware, resolveTenantContextOptional)
export class AccountNetworkController extends Controller {
  @Get()
  public async listAccountNetworks(
    @Path() accountUid: string,
    @Request() req: express.Request,
    @Query() networkName?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
  ): Promise<AccountNetworkList> {
    const result = await AccountNetworkService.listAccountNetworks({
      userId: req.user.id,
      accountUid,
      networkName,
      page: page || 1,
      limit: limit || 10,
    });

    return {
      data: result.data,
      pagination: result.pagination,
    };
  }
}
