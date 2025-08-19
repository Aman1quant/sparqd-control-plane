import * as express from 'express';
import { Body, BodyProp, Controller, Get, Middlewares, Path, Post, Query, Request, Route, SuccessResponse, Tags } from "tsoa";
import { Account, AccountCreateInput, AccountList, AccountNetworkConfig, AccountStorageConfig } from './account.type';
import * as AccountService from './account.service';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional } from '@/middlewares/resolveTenantContext';
import { PrismaClient } from '@prisma/client';
import { AccountPlanEnum } from '../_shared/shared.dto';

@Route('accounts')
@Tags('Accounts')
@Middlewares(authMiddleware, resolveTenantContextOptional)
export class AccountController extends Controller {

  @Get('/')
  @SuccessResponse(200)
  public async listAccounts(
    @Request() req: express.Request,
    @Query() name?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<AccountList> {
    try {
      const result = await AccountService.listAccounts({
        userId: req.user.id,
        name: name || '',
        page: page || 1,
        limit: limit || 10,
      });
      return {
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      const errorResponse = error as Error;
      throw { statusCode: 500, message: errorResponse.message || 'Internal Server Error' };
    }
  }

  @Get('/{uid}')
  public async getAccount(@Request() req: express.Request, @Path() uid: string): Promise<Account | null> {
    const result = await AccountService.getAccount(req.user.id, uid)
    return result
  }

  @Post('/')
  public async createAccount(
    @Body() body: AccountCreateInput
    // @Request() req: express.Request,
    // @BodyProp() name: string,
    // @BodyProp() regionUid: string,
    // @BodyProp() plan: AccountPlanEnum,
    // @BodyProp() storageConfig: AccountStorageConfig,
    // @BodyProp() networkConfig: AccountNetworkConfig,
    // @BodyProp() isDefault: boolean,
  ): Promise<Account> {
    const prisma = new PrismaClient();
    const account = await prisma.$transaction(async (tx) => {
      // return await AccountService.createAccountTx(tx, {
      //   user: req.user,
      //   name,
      //   regionUid,
      //   plan,
      //   storageConfig,
      //   networkConfig,
      //   isDefault,
      // });
      return await AccountService.createAccountTx(tx, body)
    });
    return account
  }
}
