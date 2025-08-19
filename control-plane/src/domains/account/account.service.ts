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
} from './account.type';
import { HttpError } from '@/types/errors';

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
export interface UpdateAccountData {
  name?: string;
  kcRealmStatus?: P.RealmStatus;
}

export async function editAccount(uid: string, data: UpdateAccountData): Promise<Account> {
  const account = await prisma.account.update({
    where: { uid },
    data,
    select: accountSelect,
  });

  if (!account) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }

  return account;
}

export async function deleteAccount(uid: string): Promise<Account> {
  const account = await prisma.account.delete({
    where: { uid },
    select: accountSelect,
  });

  if (!account) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }
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
export async function createAccountTx(tx: Prisma.TransactionClient, data: AccountCreateInput): Promise<Account> {
  // Create account
  const account = await tx.account.create({
    data: {
      name: data.name,
      region: {
        connect: { uid: '' }
      },
      createdBy: {
        connect: { id: data.userId }
      },
      plan: data.plan
    },
    include: {
      region: {
        include: { cloudProvider: true }
      },
    }
  });

  if (!account) {
    throw {
      status: 500,
      message: 'Failed to create account',
    };
  }

  // Assign account membership & role
  const accountOwnerRole = await getRoleByName('AccountOwner');
  await AccountMemberService.createAccountMemberTx(tx, {
    userId: data.userId as unknown as bigint,
    accountId: account.id,
    roleId: accountOwnerRole?.id || -1,
  });

  return account

}

/******************************************************************************
 * Create onboarding account
 *****************************************************************************/
export async function createOnboardingAccountTx(tx: Prisma.TransactionClient, data: OnboardingAccountCreateInput): Promise<Account> {

  const user = await tx.user.findUnique({ where: { id: data.userId } })
  if (!user) {
    throw new HttpError(404, "User not found")
  }

  // Create account
  const account = await tx.account.create({
    data: {
      name: data.name,
      region: {
        connect: { uid: '' }
      },
      createdBy: {
        connect: { id: user.id }
      },
      plan: data.plan
    },
    include: {
      region: {
        include: { cloudProvider: true }
      },
    }
  });

  if (!account) {
    throw {
      status: 500,
      message: 'Failed to create account',
    };
  }

  // Assign account membership & role
  const accountOwnerRole = await getRoleByName('AccountOwner');
  await AccountMemberService.createAccountMemberTx(tx, {
    userId: data.userId as unknown as bigint,
    accountId: account.id,
    roleId: accountOwnerRole?.id || -1,
  });

  // Create account billing
  await AccountBillingService.createAccountBillingTx(tx, {
    accountId: account.id,
    billingEmail: user.email,
  });

  // Create account network
  const networkConfig: AccountNetworkConfig = {
    name: 'default',
    providerName: 'AWS',
    config: {
      vpcId: config.provisioningFreeTierAWS.vpcId,
      securityGroupIds: config.provisioningFreeTierAWS.securityGroupIds,
      subnetIds: config.provisioningFreeTierAWS.subnetIds,
    },
  };

  // Validate
  logger.debug({ networkConfig }, 'networkConfig');
  const networkConfigParsed = accountNetworkConfigSchema.safeParse(networkConfig);
  if (!networkConfigParsed.success) {
    throw {
      status: 400,
      message: 'Invalid networkConfig',
      issues: networkConfigParsed.error.format(),
    };
  }

  await AccountNetworkService.createAccountNetworkTx(tx, {
    account: { connect: { id: account.id } },
    networkName: data.name,
    networkConfig: networkConfig as unknown as Prisma.InputJsonValue,
    createdBy: { connect: { id: user.id } },
  });

  // Create account storage
  // If it's default account --> override
  // Prepare configs
  let storageConfig: AccountStorageConfig;


  storageConfig = {
    name: 'default',
    providerName: 'AWS',
    dataPath: `s3://${config.provisioningFreeTierAWS.s3Bucket}/${account.uid}/data`,
    tofuBackend: {
      type: 's3',
      bucket: config.provisioningFreeTierAWS.s3Bucket,
      key: `${account.uid}/tofuState`,
      region: config.provisioningFreeTierAWS.defaultRegion,

    }
  }

  // Validate
  logger.debug({ storageConfig }, 'storageConfig');
  const storageConfigParsed = accountStorageConfigSchema.safeParse(storageConfig);
  if (!storageConfigParsed.success) {
    throw {
      status: 400,
      message: 'Invalid storageConfig',
      issues: storageConfigParsed.error.format(),
    };
  }

  await AccountStorageService.createAccountStorageTx(tx, {
    account: { connect: { id: account.id } },
    storageName: 'default',
    storageConfig: storageConfig as unknown as Prisma.InputJsonValue,
    createdBy: { connect: { id: user.id } },
  });

  return {
    uid: account.uid,
    name: account.name,
    region: account.region,
    plan: account.plan,
    metadata: account.metadata,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  }
}