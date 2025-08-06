export interface WriteTfVarsJsonFileInput {
  tfVarsJsonData: any;
  outputPath: string;
}

/******************************************************************************
 * AWS Provisioning types
 *****************************************************************************/
// export interface S3BackendConfig {
//   bucket: string;
//   key: string;
//   region?: string;
//   encrypt?: string;
// }

// export interface ProvisionClusterWorkflowInput {
//   op: 'create' | 'update' | 'destroy';
//   clusterUid: string;
//   isFreeTier: boolean;
//   tofuBackendConfig: TofuBackendConfig;
//   tofuTemplateDir?: string;
//   tofuTemplateGitRepo?: string;
//   tofuTemplatePath: string;
//   tofuTfvars: any;
// }
