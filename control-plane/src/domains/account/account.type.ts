import z from 'zod';

import {
  alicloudTofuBackendSchema,
  awsTofuBackendSchema,
  gcpTofuBackendSchema,
  tofuBackendConfigSchema,
} from '@/workflow/clusterProvisioning/clusterProvisioning.type';

import { AccountPlanEnum, PaginationInfo } from '../_shared/shared.dto';
import { CloudProvider } from '../region/region.type';
import { CreatedByInfo } from '../user/user.type';

export interface Account {
  /**
   * Account unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * Account name
   * @example "Example Account"
   */
  name: string;
  region: {
    cloudProvider: CloudProvider;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata: any;
  plan: AccountPlanEnum;
  createdBy: CreatedByInfo
}

export interface AccountList {
  data: Account[];
  pagination: PaginationInfo;
  serverTime?: string;
}

export interface AccountFilters {
  userId: bigint;
  name?: string;
  page?: number;
  limit?: number;
}

export class AccountCreateInput {
  /**
   * Account name
   * @example "Example Account"
   */
  name!: string;
  /**
   * Cloud region unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  regionUid!: string;
  plan!: AccountPlanEnum;
}

export interface PartialAccountPatchInput {
  /**
   * Account name
   * @example "Example Account"
   */
  name?: string;
}

export class OnboardingAccountCreateInput {
  name!: string;
  regionUid!: string;
  plan!: AccountPlanEnum;
  backendConfig!: AccountStorageBackendConfig;
  networkConfig!: AccountNetworkConfig;
  userId!: number;
  isDefault?: boolean;
}

// Service types
export interface AccountCreateServiceInput {
  name: string;
  regionUid: string;
  userId: bigint;
  plan: AccountPlanEnum;
}

/******************************************************************************
 * Account storage config
 *****************************************************************************/
export const accountStorageBackendConfigSchema = tofuBackendConfigSchema;

// TypeScript types inferred from Zod schemas
export type AccountStorageBackendConfig = z.infer<typeof tofuBackendConfigSchema>;

/******************************************************************************
 * Account network config
 *****************************************************************************/
export const awsAccountNetworkConfigSchema = z.object({
  vpcId: z.string(),
  subnetIds: z.array(z.string()),
  securityGroupIds: z.array(z.string()),
});

export const alicloudAccountNetworkConfigSchema = z.object({
  vpcId: z.string(),
  subnetIds: z.array(z.string()),
  securityGroupIds: z.array(z.string()),
});

export const gcpAccountNetworkConfigSchema = z.object({
  vpcName: z.string(),
  subnetNames: z.array(z.string()),
  firewallTag: z.array(z.string()),
});

export const accountNetworkConfigSchema = z.union([
  awsAccountNetworkConfigSchema,
  alicloudAccountNetworkConfigSchema,
  gcpAccountNetworkConfigSchema
]);

// TypeScript types inferred from Zod schemas
export type AccountNetworkConfig = z.infer<typeof accountNetworkConfigSchema>;
