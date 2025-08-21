import * as AccountBillingService from '@domains/account/accountBilling.service';
import * as AccountMemberService from '@domains/account/accountMember.service';
import * as AccountNetworkService from '@domains/account/accountNetwork.service';
import * as AccountStorageService from '@domains/account/accountStorage.service';
// import { Account, Prisma, PrismaClient, RealmStatus } from '@prisma/client';
import { PrismaClient, Prisma } from '@prisma/client';
import *  as P from '@prisma/client';

import config from '@/config/config';
import logger from '@/config/logger';
import { offsetPagination } from '@/utils/api';

import { getRoleByName } from '../permission/role.service';
import { accountSelect } from './account.select';
import {
  // AccountCreated,
  AccountCreateInput,
  // AccountDetail,
  AccountFilters,
  AccountList,
  AccountNetworkConfig,
  accountNetworkConfigSchema,
  Account,
  AccountStorageConfig,
  accountStorageConfigSchema,
  OnboardingAccountCreateInput,
  AccountCreateServiceInput,
  PartialAccountPatchInput,
} from './account.type';
import { HttpError } from '@/types/errors';
import { regionSelect } from '../region/region.select';
import { createdByUserSelect } from '../_shared/shared.select';

const prisma = new PrismaClient();

/******************************************************************************
 * List available accounts
 *****************************************************************************/
export async function listAccounts({ userId, name, page = 1, limit = 10 }: AccountFilters): Promise<AccountList> {
  const whereClause: Record<string, unknown> = {};

  // IMPORTANT: Mandatory filter by userId
  whereClause.members = {
    some: {
      userId,
    },
  };

  // OPTIONALS
  if (name) {
    whereClause.name = {
      contains: name,
      mode: 'insensitive' as const,
    };
  }

  logger.debug({ userId }, 'Listing accounts for a user');

  const [totalData, accounts] = await Promise.all([
    prisma.account.count({ where: whereClause }),
    prisma.account.findMany({
      where: whereClause,
      select: accountSelect,
      skip: offsetPagination(page, limit),
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: accounts,
    pagination: {
      currentPage: page,
      totalPages,
      totalData,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/******************************************************************************
 * Get an account
 *****************************************************************************/
export async function getAccount(userId: bigint, uid: string): Promise<Account | null> {
  const account = await prisma.account.findUnique({
    where: { uid, members: { some: { userId } } },
    select: accountSelect,
  });

  if (!account) {
    throw new HttpError(404, 'Account not found')
  }

  return account;
}

/******************************************************************************
 * Update an account
 *****************************************************************************/
export async function patchAccount(uid: string, userId: bigint, data: PartialAccountPatchInput): Promise<Account> {
  const account = await prisma.account.update({
    where: { uid, members: { some: { userId } } },
    data,
    select: accountSelect,
  });

  if (!account) { throw new HttpError(404, 'Account not found') }

  return account;
}

export async function deleteAccount(uid: string): Promise<Account> {
  const account = await prisma.account.delete({
    where: { uid },
    select: accountSelect,
  });

  if (!account) { throw new HttpError(404, 'Account not found') }

  return account;
}

export async function getAccountPlan(uid: string): Promise<string> {
  const account = await prisma.account.findUnique({ where: { uid } });
  if (!account) {
    throw new HttpError(404, 'Account not found')
  }
  return account.plan;
}

/******************************************************************************
 * Create an account
 *****************************************************************************/
export async function createAccountTx(tx: Prisma.TransactionClient, data: AccountCreateServiceInput): Promise<Account> {
  // Create account
  const account = await tx.account.create({
    data: {
      name: data.name,
      region: {
        connect: { uid: data.regionUid }
      },
      createdBy: {
        connect: { id: data.userId as unknown as bigint }
      },
      plan: data.plan
    },
    include: {
      region: {
        select: regionSelect,
      },
      createdBy: {
        select: createdByUserSelect,
      }
    }
  });

  if (!account) { throw new HttpError(400, 'Invalid parameters') }

  // Assign account membership & role
  const accountOwnerRole = await getRoleByName('AccountOwner');
  await AccountMemberService.createAccountMemberTx(tx, {
    userId: data.userId as unknown as bigint,
    accountId: account.id,
    roleId: accountOwnerRole?.id || -1,
  });

  // Sanitize response to omit `id` fields
  const { id, createdById, regionId, ...response } = account;
  logger.debug({ response }, "Account created response")
  return response;

}
