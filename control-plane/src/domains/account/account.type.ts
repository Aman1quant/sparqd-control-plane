import { Account, AccountNetwork, AccountStorage, Prisma, Region, User } from '@prisma/client';
import z from 'zod'
import { describeAccountSelect } from './account.select';


export interface AccountFilters {
  userId: bigint;
  name?: string;
  page?: number;
  limit?: number;
}

export interface AccountCreateInput {
  name: string;
  region: Region;
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
const awsTofuBackendSchema = z.object({
  type: z.literal("s3"),
  bucket: z.string(),
  key: z.string(),
  region: z.string()
});

const gcpTofuBackendSchema = z.object({
  type: z.literal("gcs"),
  bucket: z.string(),
  prefix: z.string()
});

const alicloudTofuBackendSchema = z.object({
  type: z.literal("oss"),
  bucket: z.string(),
  prefix: z.string(),
  key: z.string(),
  region: z.string(),
  tablestore_endpoint: z.string(),
  tablestore_table: z.string()
});

export const tofuBackendConfigSchema = z.union([
  awsTofuBackendSchema,
  gcpTofuBackendSchema,
  alicloudTofuBackendSchema
]);
export type TofuBackendConfig = z.infer<typeof tofuBackendConfigSchema>;

export const baseAccountStorageConfigSchema = z.object({
  providerName: z.string(),
  name: z.string(),
  tofuBackend: tofuBackendConfigSchema, // ✅ not z.any()
  dataPath: z.string()
});

export const awsAccountStorageConfigSchema =
  baseAccountStorageConfigSchema.extend({
    providerName: z.literal("AWS"),
    tofuBackend: awsTofuBackendSchema
  });

export const gcpAccountStorageConfigSchema =
  baseAccountStorageConfigSchema.extend({
    providerName: z.literal("GCP"),
    tofuBackend: gcpTofuBackendSchema
  });

export const alicloudAccountStorageConfigSchema =
  baseAccountStorageConfigSchema.extend({
    providerName: z.literal("ALICLOUD"),
    tofuBackend: alicloudTofuBackendSchema
  });

export const accountStorageConfigSchema = z.union([
  awsAccountStorageConfigSchema,
  gcpAccountStorageConfigSchema,
  alicloudAccountStorageConfigSchema
]);

// TypeScript types inferred from Zod schemas
export type AccountStorageConfig = z.infer<typeof accountStorageConfigSchema>;
export type AwsAccountStorageConfig = z.infer<typeof awsAccountStorageConfigSchema>;
export type GcpAccountStorageConfig = z.infer<typeof gcpAccountStorageConfigSchema>;
export type AlicloudAccountStorageConfig = z.infer<typeof alicloudAccountStorageConfigSchema>;

/******************************************************************************
 * Account network config
 *****************************************************************************/
export const baseAccountNetworkConfigSchema = z.object({
  providerName: z.string(),
  name: z.string(),
  config: z.any()
})

export const awsAccountNetworkConfigSchema = baseAccountNetworkConfigSchema.extend(
  {
    providerName: z.literal("AWS"),
    name: z.string(),
    config: z.object({
      vpcId: z.string(),
      subnetIds: z.array(z.string()),
      securityGroupIds: z.array(z.string())
    })
  }
)

export const alicloudAccountNetworkConfigSchema = baseAccountNetworkConfigSchema.extend(
  {
    providerName: z.literal("ALICLOUD"),
    name: z.string(),
    config: z.object({
      vpcId: z.string(),
      subnetIds: z.array(z.string()),
      securityGroupIds: z.array(z.string())
    })
  }
)

export const gcpAccountNetworkConfigSchema = baseAccountNetworkConfigSchema.extend(
  {
    providerName: z.literal("GCP"),
    name: z.string(),
    config: z.object({
      vpcName: z.string(),
      subnetNames: z.array(z.string()),
      firewallTag: z.array(z.string())
    })
  }
)

export const accountNetworkConfigSchema = z.union([
  awsAccountNetworkConfigSchema,
  alicloudAccountNetworkConfigSchema,
  gcpAccountNetworkConfigSchema,
])
// TypeScript types inferred from Zod schemas
export type AccountNetworkConfig = z.infer<typeof accountNetworkConfigSchema>;
export type AwsAccountNetworkConfig = z.infer<typeof awsAccountNetworkConfigSchema>;
export type AlicloudAccountNetworkConfig = z.infer<typeof alicloudAccountNetworkConfigSchema>;
export type GcpAccountNetworkConfig = z.infer<typeof gcpAccountNetworkConfigSchema>;
