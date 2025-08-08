// import { Cluster } from '@prisma/client';

import { TofuBackendConfig } from "@/domains/account/account.type";

export type ClusterWorkflowOp = 'CREATE' | 'UPDATE' | 'DELETE';

export interface ClusterProvisionConfig {
  op: ClusterWorkflowOp;
  clusterUid: string;
  tofuTemplateDir: string;
  tofuTemplatePath: string;
  tofuBackendConfig: TofuBackendConfig;
  tofuTfvars: object;
}

export interface WriteTfVarsJsonFileInput {
  tfVarsJsonData: any;
  outputPath: string;
}
