import { Cluster } from '@prisma/client';

export type ClusterWorkflowOp = 'CREATE' | 'UPDATE' | 'DELETE';

// Common backend config types
export type TofuBackendConfig =
  | {
      type: 's3';
      config: {
        bucket: string;
        key: string;
        region: string;
        profile?: string;
        encrypt?: boolean;
        dynamodb_table?: string;
      };
    }
  | {
      type: 'gcs';
      config: {
        bucket: string;
        prefix?: string;
        credentials?: string;
      };
    };

// Base
interface BaseClusterProvisionConfig {
  provider: string; // overridden in subtypes
  op: ClusterWorkflowOp;
  dummy?: boolean;
  clusterUid: string;
}

// Per-provider provision config — only provider-specific Terraform inputs
export interface FreeTierClusterProvisionConfig extends BaseClusterProvisionConfig {
  tofuTemplateDir?: string;
  tofuTemplatePath?: string;
  tofuTfvars?: Partial<{
    region: string;
    free_tier_subnet_ids: string[];
    free_tier_eks_cluster_name: string;
    tenant_node_instance_types: string[];
    tenant_node_desired_size: number;
    tenant_node_min_size: number;
    tenant_node_max_size: number;
  }>;
  tofuBackendConfig?: TofuBackendConfig;
}

export interface AwsClusterProvisionConfig extends BaseClusterProvisionConfig {
  tofuTemplateDir?: string;
  tofuTemplatePath?: string;
  tofuTfvars?: Partial<{
    region: string;
    tenant_subnet_ids: string[];
    tenant_eks_cluster_name: string;
    tenant_node_instance_types: string[];
    tenant_node_desired_size: number;
    tenant_node_min_size: number;
    tenant_node_max_size: number;
  }>;
  tofuBackendConfig?: TofuBackendConfig;
}

export interface GcpClusterProvisionConfig extends BaseClusterProvisionConfig {
  tofuTemplateDir?: string;
  tofuTemplatePath?: string;
  tofuTfvars?: Partial<{
    region: string;
    machine_type: string;
    node_count: number;
  }>;
  tofuBackendConfig?: TofuBackendConfig;
}

export type ClusterProvisionConfig = FreeTierClusterProvisionConfig | AwsClusterProvisionConfig | GcpClusterProvisionConfig;

export interface StartClusterWorkflowArgs {
  op: ClusterWorkflowOp;
  clusterUid: string;
  isFreeTier: boolean;
  // provisionConfig: FreeTierClusterProvisionConfig | AwsClusterProvisionConfig | GcpClusterProvisionConfig;
  provisionConfig: ClusterProvisionConfig;
  dummy?: boolean;
}
