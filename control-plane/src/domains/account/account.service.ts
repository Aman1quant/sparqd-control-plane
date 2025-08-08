import * as AccountBillingService from '@domains/account/accountBilling.service';
import * as AccountMemberService from '@domains/account/accountMember.service';
import * as AccountNetworkService from '@domains/account/accountNetwork.service';
import * as AccountStorageService from '@domains/account/accountStorage.service';
import { Account, Prisma, PrismaClient, Provider, RealmStatus } from '@prisma/client';

import config from '@/config/config';
import logger from '@/config/logger';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

import { getRoleByName } from '../permission/role.service';
import { describeAccountSelect } from './account.select';
import { AccountCreated, AccountCreateInput, AccountDetail, AccountFilters, AccountNetworkConfig, accountNetworkConfigSchema, AccountStorageConfig, accountStorageConfigSchema } from './account.type';

const prisma = new PrismaClient();

/******************************************************************************
 * Create an account
 *****************************************************************************/
export async function createAccountTx(tx: Prisma.TransactionClient, data: AccountCreateInput): Promise<AccountCreated> {
  // Get systemUser
  const systemUser = await tx.user.findUnique({ where: { email: config.systemUserEmail } });
  if (!systemUser) {
    throw {
      status: 500,
      message: 'Failed to create account',
    };
  }

  // Create account
  const account = await tx.account.create({
    data: {
      name: data.name,
      regionId: data.region.id,
      createdById: data.user.id,
    },
  });

  // Assign account membership & role
  const accountOwnerRole = await getRoleByName('AccountOwner');
  await AccountMemberService.createAccountMemberTx(tx, {
    userId: data.user.id,
    accountId: account.id,
    roleId: accountOwnerRole?.id || -1,
  });

  // Create account billing
  await AccountBillingService.createAccountBillingTx(tx, {
    accountId: account.id,
    billingEmail: data.user.email,
  });

  // Create account network
  // If it's default account --> override
  let networkConfig: AccountNetworkConfig;

  if (data.isDefault) {
    networkConfig = {
      name: 'default',
      providerName: "AWS",
      config: {
        vpcId: config.provisioningFreeTierAWS.vpcId,
        securityGroupIds: config.provisioningFreeTierAWS.securityGroupIds,
        subnetIds: config.provisioningFreeTierAWS.subnetIds,
      },
    };
  } else {
    networkConfig = data.networkConfig;
  }

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

  const accountNetwork = await AccountNetworkService.createAccountNetworkTx(tx, {
    account: { connect: { id: account.id } },
    networkName: data.name,
    networkConfig: networkConfig as unknown as Prisma.InputJsonValue,
    createdBy: { connect: { id: data.user.id } },
  });

  // Create account storage
  // If it's default account --> override
  // Prepare configs
  let storageConfig: AccountStorageConfig;

  if (data.isDefault) {
    storageConfig = {
      name: 'default',
      providerName: "AWS",
      dataPath: `s3://${config.provisioningFreeTierAWS.s3Bucket}/${account.uid}/data`,
      tofuBackend: {
        type: "s3",
        bucket: config.provisioningFreeTierAWS.s3Bucket,
        key: `${account.uid}/tofuState`,
        region: config.provisioningFreeTierAWS.defaultRegion,
      },
    };
  } else {
    storageConfig = data.storageConfig;
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

  const accountStorage = await AccountStorageService.createAccountStorageTx(tx, {
    account: { connect: { id: account.id } },
    storageName: 'default',
    storageConfig: storageConfig as unknown as Prisma.InputJsonValue,
    createdBy: { connect: { id: data.user.id } },
  });

  if (!account) {
    throw {
      status: 500,
      message: 'Failed to create account',
    };
  }
  return {
    account,
    accountStorage,
    accountNetwork,
  };
}

/******************************************************************************
 * List available accounts
 *****************************************************************************/
export async function listAccount({ userId, name, page = 1, limit = 10 }: AccountFilters): Promise<PaginatedResponse<AccountDetail>> {
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
      select: describeAccountSelect,
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
export async function describeAccount(uid: string): Promise<AccountDetail | null> {
  const account = await prisma.account.findUnique({
    where: { uid },
    select: describeAccountSelect,
  });

  if (!account) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }

  return account;
}

/******************************************************************************
 * Update an account
 *****************************************************************************/
export interface UpdateAccountData {
  name?: string;
  kcRealmStatus?: RealmStatus;
}

export async function editAccount(uid: string, data: UpdateAccountData): Promise<Account> {
  const account = await prisma.account.update({
    where: { uid },
    data,
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
    throw {
      status: 404,
      message: 'Account not found',
    };
  }
  return account.plan;
}
