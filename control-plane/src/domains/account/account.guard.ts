import { createGuard, isExactObject, isPartialObject, isStringArray } from '@/helpers/typeGuard';

import {
  AccountNetworkConfig,
  AccountStorageConfig,
  AlicloudAccountStorageConfig,
  AwsAccountNetworkConfig,
  AwsAccountStorageConfig,
  BaseAccountStorageConfig,
  GcpAccountStorageConfig,
} from './account.type';

/******************************************************************************
 * Account storage config
 *****************************************************************************/
function isBaseAccountStorageConfig(obj: any): obj is BaseAccountStorageConfig {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.provider === 'string' &&
    typeof obj.dataPath === 'string' &&
    (obj.tofuBackend === undefined ||
      isPartialObject(obj.tofuBackend, {
        bucket: (v) => typeof v === 'string',
        key: (v) => typeof v === 'string',
        region: (v) => typeof v === 'string',
      }))
  );
}

function isAwsAccountStorageConfig(obj: any): obj is AwsAccountStorageConfig {
  return (
    isBaseAccountStorageConfig(obj) &&
    obj.provider === 'AWS' &&
    typeof obj.name === 'string' &&
    obj.tofuBackend !== undefined &&
    isExactObject(obj.tofuBackend, {
      bucket: (v) => typeof v === 'string',
      key: (v) => typeof v === 'string',
      region: (v) => typeof v === 'string',
    })
  );
}

function isGcpAccountStorageConfig(obj: any): obj is GcpAccountStorageConfig {
  return (
    isBaseAccountStorageConfig(obj) &&
    obj.provider === 'GCP' &&
    typeof obj.name === 'string' &&
    obj.tofuBackend !== undefined &&
    isExactObject(obj.tofuBackend, {
      bucket: (v) => typeof v === 'string',
      prefix: (v) => typeof v === 'string',
    })
  );
}

function isAlicloudAccountStorageConfig(obj: any): obj is AlicloudAccountStorageConfig {
  return (
    isBaseAccountStorageConfig(obj) &&
    obj.provider === 'ALICLOUD' &&
    typeof obj.name === 'string' &&
    obj.tofuBackend !== undefined &&
    isExactObject(obj.tofuBackend, {
      bucket: (v) => typeof v === 'string',
      prefix: (v) => typeof v === 'string',
      key: (v) => typeof v === 'string',
      region: (v) => typeof v === 'string',
      tablestore_endpoint: (v) => typeof v === 'string',
      tablestore_table: (v) => typeof v === 'string',
    })
  );
}

export const isAccountStorageConfig = createGuard<AccountStorageConfig>(
  (value) => isAwsAccountStorageConfig(value) || isGcpAccountStorageConfig(value) || isAlicloudAccountStorageConfig(value),
);

/******************************************************************************
 * Account network config
 *****************************************************************************/
// function isBaseAccountNetworkConfig(obj: any): obj is BaseAccountNetworkConfig {
//   return typeof obj === 'object' && obj !== null && typeof obj.provider === 'string';
// }

function isAwsAccountNetworkConfig(obj: any): obj is AwsAccountNetworkConfig {
  return (
    obj &&
    obj.provider === 'AWS' &&
    typeof obj.name === 'string' &&
    obj.config !== undefined &&
    isExactObject(obj.config, {
      vpcId: (v) => typeof v === 'string',
      subnetIds: isStringArray,
      securityGroupIds: isStringArray,
    })
  );
}

export const isAccountNetworkConfig = createGuard<AccountNetworkConfig>(
  (value) => isAwsAccountNetworkConfig(value) || isAwsAccountNetworkConfig(value),
  // || isAlicloudAccountNetworkConfig(value),
);
