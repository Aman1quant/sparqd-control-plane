import * as express from 'express';
import { Controller, Get, Middlewares, Path, Query, Request, Route, Tags } from "tsoa";
import * as AccountStorageService from './accountStorage.service';
import { AccountStorageList } from './accountStorage.type';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional } from '@/middlewares/resolveTenantContext';

@Route("accounts/{accountUid}/storages")
@Tags("Account Storages")
@Middlewares(authMiddleware, resolveTenantContextOptional)
export class AccountStorageController extends Controller {

  @Get()
  public async listAccountStorages(
    @Path() accountUid: string,
    @Request() req: express.Request,
    @Query() storageName?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<AccountStorageList> {
      const result = await AccountStorageService.listAccountStorages({
        userId: req.user.id,
        accountUid,
        storageName,
        page: page || 1,
        limit: limit || 10,
      });
      return {
        data: result.data,
        pagination: result.pagination,
      };
  }

}
