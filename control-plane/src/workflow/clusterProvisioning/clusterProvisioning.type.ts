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

// Per-provider provision config — only provider-specific Terraform inputs
export interface AwsClusterProvisionConfig {
  type: 'aws';
  tofuTemplateDir?: string;
  tofuTemplatePath?: string;
  tofuTfvars?: Partial<{
    region: string;
    shared_subnet_ids: string[];
    shared_eks_cluster_name: string;
    tenant_node_instance_types: string[];
    tenant_node_desired_size: number;
    tenant_node_min_size: number;
    tenant_node_max_size: number;
  }>;
  tofuBackendConfig?: TofuBackendConfig;
}

export interface GcpClusterProvisionConfig {
  type: 'gcp';
  tofuTemplateDir?: string;
  tofuTemplatePath?: string;
  tofuTfvars?: Partial<{
    region: string;
    machine_type: string;
    node_count: number;
  }>;
  tofuBackendConfig?: TofuBackendConfig;
}

export interface GenericClusterProvisionInput {
  type: 'aws' | 'gcp';
  op: ClusterWorkflowOp;
  dummy?: boolean;
  clusterUid: string;
  isFreeTier?: boolean;
  tofuTemplateDir: string;
  tofuTemplatePath: string;
  tofuTfvars: Record<string, unknown>;
  tofuBackendConfig: TofuBackendConfig;
}

export interface StartClusterWorkflowArgs {
  op: ClusterWorkflowOp;
  clusterUid: string;
  isFreeTier: boolean;
  provisionConfig: AwsClusterProvisionConfig | GcpClusterProvisionConfig;
  dummy?: boolean;
}
