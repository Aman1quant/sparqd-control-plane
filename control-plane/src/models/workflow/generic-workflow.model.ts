import { Cluster } from "@prisma/client";

export type ClusterWorkflowOp = 'create' | 'update' | 'delete';
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
      credentials?: string; // base64 or path
    };
  };
export interface GenericClusterProvisionInput {
  op: ClusterWorkflowOp;
  tofuTemplateDir: string;
  tofuTemplatePath: string;
  tofuTfvars: Record<string, unknown>;
  tofuBackendConfig: TofuBackendConfig;
  clusterUid: string;
  isFreeTier?: boolean;
}

export interface StartClusterWorkflowArgs {
  op: ClusterWorkflowOp;
  cluster: Cluster;
  overrides?: Partial<GenericClusterProvisionInput>;
}
