import * as express from 'express';
import { Body, Controller, Delete, Get, Middlewares, Patch, Path, Post, Query, Request, Response, Route, SuccessResponse, Tags } from "tsoa";

import { Account, AccountCreateInput, AccountList, PartialAccountPatchInput } from './account.type';
import * as AccountService from './account.service';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional } from '@/middlewares/resolveTenantContext';
import { PrismaClient } from '@prisma/client';
import { ValidateErrorJSON } from '../_shared/shared.controller';


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
  }

  @Get('/{uid}')
  public async getAccount(@Request() req: express.Request, @Path() uid: string): Promise<Account | null> {
    const result = await AccountService.getAccount(uid, req.user.id)
    return result
  }

  @Post('/')
  @SuccessResponse("201", "Created")
  @Response<ValidateErrorJSON>(400, "Validation Failed")
  public async createAccount(@Request() req: express.Request, @Body() body: AccountCreateInput): Promise<Account> {
    const prisma = new PrismaClient();
    const account = await prisma.$transaction(async (tx) => {
      return await AccountService.createAccountTx(tx, { ...body, userId: req.user.id })
    });
    return account
  }

  @Patch('/{uid}')
  public async patchAccount(@Request() req: express.Request, @Path() uid: string, @Body() body: PartialAccountPatchInput): Promise<Account> {
    return await AccountService.patchAccount(uid, req.user.id, body)
  }

  @Delete('/{uid}')
  public async deleteAccount(@Request() req: express.Request, @Path() uid: string): Promise<Account> {
    const prisma = new PrismaClient();
    const account = await prisma.$transaction(async (tx) => {
      return await AccountService.deleteAccountTx(tx, uid, req.user.id)
    })
    return account
  }
}
