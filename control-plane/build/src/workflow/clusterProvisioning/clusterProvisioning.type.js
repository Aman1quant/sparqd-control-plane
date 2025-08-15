"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clusterProvisionConfigSchema = exports.tofuBackendConfigSchema = exports.alicloudTofuBackendSchema = exports.gcpTofuBackendSchema = exports.awsTofuBackendSchema = void 0;
const zod_1 = require("zod");
exports.awsTofuBackendSchema = zod_1.z.object({
    type: zod_1.z.literal('s3'),
    bucket: zod_1.z.string(),
    key: zod_1.z.string(),
    region: zod_1.z.string(),
});
exports.gcpTofuBackendSchema = zod_1.z.object({
    type: zod_1.z.literal('gcs'),
    bucket: zod_1.z.string(),
    prefix: zod_1.z.string(),
});
exports.alicloudTofuBackendSchema = zod_1.z.object({
    type: zod_1.z.literal('oss'),
    bucket: zod_1.z.string(),
    prefix: zod_1.z.string(),
    key: zod_1.z.string(),
    region: zod_1.z.string(),
    tablestore_endpoint: zod_1.z.string(),
    tablestore_table: zod_1.z.string(),
});
exports.tofuBackendConfigSchema = zod_1.z.union([exports.awsTofuBackendSchema, exports.gcpTofuBackendSchema, exports.alicloudTofuBackendSchema]);
exports.clusterProvisionConfigSchema = zod_1.z.object({
    clusterUid: zod_1.z.string(),
    tofuTemplateDir: zod_1.z.string(),
    tofuTemplatePath: zod_1.z.string(),
    tofuBackendConfig: exports.tofuBackendConfigSchema,
    tofuTfvars: zod_1.z.any(),
});
