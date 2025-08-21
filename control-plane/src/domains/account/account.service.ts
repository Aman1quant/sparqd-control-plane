import * as AccountMemberService from '@domains/account/accountMember.service';
import { PrismaClient, Prisma } from '@prisma/client';
import logger from '@/config/logger';
import { offsetPagination } from '@/utils/api';
import { getRoleByName } from '../permission/role.service';
import { accountSelect } from './account.select';
import {
  AccountFilters,
  AccountList,
  Account,
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
export async function getAccount(uid: string, userId: bigint): Promise<Account | null> {
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
 * Patch an account
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

/******************************************************************************
 * Delete an account
 *****************************************************************************/
export async function deleteAccountTx(tx: Prisma.TransactionClient, uid: string, userId: bigint): Promise<Account> {
  const toDelete = await tx.account.findUnique({
    where: { uid, members: { some: { userId } } },
  })
  if (!toDelete) { throw new HttpError(404, 'Account not found') }

  const account = await tx.account.delete({
    where: { id: toDelete.id },
    select: accountSelect,
  });

  return account;
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

export async function getAccountPlan(uid: string): Promise<string> {
  const account = await prisma.account.findUnique({ where: { uid } });
  if (!account) {
    throw new HttpError(404, 'Account not found')
  }
  return account.plan;
}
