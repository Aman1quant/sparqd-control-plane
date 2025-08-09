import { z } from "zod";

export const awsTofuBackendSchema = z.object({
  type: z.literal("s3"),
  bucket: z.string(),
  key: z.string(),
  region: z.string()
});

export const gcpTofuBackendSchema = z.object({
  type: z.literal("gcs"),
  bucket: z.string(),
  prefix: z.string()
});

export const alicloudTofuBackendSchema = z.object({
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

export type ClusterWorkflowOp = 'CREATE' | 'UPDATE' | 'DELETE';

export const clusterProvisionConfigSchema = z.object({
  clusterUid: z.string(),
  tofuTemplateDir: z.string(),
  tofuTemplatePath: z.string(),
  tofuBackendConfig: tofuBackendConfigSchema,
  tofuTfvars: z.any()
})

export interface ClusterProvisionConfig {
  // op: ClusterWorkflowOp;
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

export type TofuBackendConfig = z.infer<typeof tofuBackendConfigSchema>;
