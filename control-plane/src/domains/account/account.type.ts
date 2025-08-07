import { Account, AccountNetwork, AccountStorage, Prisma, User } from '@prisma/client';

import { describeAccountSelect } from './account.select';

export interface AccountFilters {
  userId: bigint;
  name?: string;
  page?: number;
  limit?: number;
}

export interface AccountCreateInput {
  name: string;
  storageConfig: AccountStorageConfig;
  networkConfig: AccountNetworkConfig;
  user: User;
  isDefault?: boolean;
}

export type AccountCreated = {
  account: Account;
  accountStorage: AccountStorage;
  accountNetwork: AccountNetwork;
};

export type AccountDetail = Prisma.AccountGetPayload<{
  select: typeof describeAccountSelect;
}>;

/******************************************************************************
 * Account storage config
 *****************************************************************************/
export interface BaseAccountStorageConfig {
  provider: string; // overridden below
  name: string;
  tofuBackend: object;
  dataPath: string;
}

// https://opentofu.org/docs/language/settings/backends/s3/
export interface AwsAccountStorageConfig extends BaseAccountStorageConfig {
  provider: 'AWS';
  tofuBackend: {
    bucket: string;
    key: string;
    region: string;
  };
}

// https://opentofu.org/docs/language/settings/backends/gcs/
export interface GcpAccountStorageConfig extends BaseAccountStorageConfig {
  provider: 'GCP';
  tofuBackend: {
    bucket: string;
    prefix: string;
  };
}

// https://opentofu.org/docs/language/settings/backends/oss/
export interface AlicloudAccountStorageConfig extends BaseAccountStorageConfig {
  provider: 'ALICLOUD';
  tofuBackend: {
    bucket: string;
    prefix: string;
    key: string;
    region: string;
    tablestore_endpoint: string;
    tablestore_table: string;
  };
}

export type AccountStorageConfig = AwsAccountStorageConfig | GcpAccountStorageConfig | AlicloudAccountStorageConfig;

/******************************************************************************
 * Account network config
 *****************************************************************************/
export interface BaseAccountNetworkConfig {
  provider: string; // overridden below
  name: string;
  config: object;
}

export interface AwsAccountNetworkConfig extends BaseAccountNetworkConfig {
  provider: 'AWS';
  name: string;
  config: {
    vpcId: string;
    subnetIds: string[];
    securityGroupIds: string[];
  };
}

export type AccountNetworkConfig = AwsAccountNetworkConfig;
