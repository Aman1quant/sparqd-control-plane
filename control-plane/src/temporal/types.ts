/******************************************************************************
 * AWS Provisioning types
 *****************************************************************************/
export interface S3BackendConfig {
  bucket: string;
  key: string;
  region?: string;
  encrypt?: string;
}

export interface ProvisionAWSClusterWorkflowInput {
  clusterUid: string;
  isFreeTier: boolean;
  s3BackendConfig: S3BackendConfig;
  tofuTemplateDir?: string;
  tofuTemplateGitRepo?: string;
  tofuTemplatePath: string;
  tofuTfvars: any;
}
