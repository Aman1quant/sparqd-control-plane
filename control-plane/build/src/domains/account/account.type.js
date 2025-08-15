"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountNetworkConfigSchema = exports.gcpAccountNetworkConfigSchema = exports.alicloudAccountNetworkConfigSchema = exports.awsAccountNetworkConfigSchema = exports.baseAccountNetworkConfigSchema = exports.accountStorageConfigSchema = exports.alicloudAccountStorageConfigSchema = exports.gcpAccountStorageConfigSchema = exports.awsAccountStorageConfigSchema = exports.baseAccountStorageConfigSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const clusterProvisioning_type_1 = require("@/workflow/clusterProvisioning/clusterProvisioning.type");
/******************************************************************************
 * Account storage config
 *****************************************************************************/
exports.baseAccountStorageConfigSchema = zod_1.default.object({
    providerName: zod_1.default.string(),
    name: zod_1.default.string(),
    tofuBackend: clusterProvisioning_type_1.tofuBackendConfigSchema, // ✅ not z.any()
    dataPath: zod_1.default.string(),
});
exports.awsAccountStorageConfigSchema = exports.baseAccountStorageConfigSchema.extend({
    providerName: zod_1.default.literal('AWS'),
    tofuBackend: clusterProvisioning_type_1.awsTofuBackendSchema,
});
exports.gcpAccountStorageConfigSchema = exports.baseAccountStorageConfigSchema.extend({
    providerName: zod_1.default.literal('GCP'),
    tofuBackend: clusterProvisioning_type_1.gcpTofuBackendSchema,
});
exports.alicloudAccountStorageConfigSchema = exports.baseAccountStorageConfigSchema.extend({
    providerName: zod_1.default.literal('ALICLOUD'),
    tofuBackend: clusterProvisioning_type_1.alicloudTofuBackendSchema,
});
exports.accountStorageConfigSchema = zod_1.default.union([exports.awsAccountStorageConfigSchema, exports.gcpAccountStorageConfigSchema, exports.alicloudAccountStorageConfigSchema]);
/******************************************************************************
 * Account network config
 *****************************************************************************/
exports.baseAccountNetworkConfigSchema = zod_1.default.object({
    providerName: zod_1.default.string(),
    name: zod_1.default.string(),
    config: zod_1.default.any(),
});
exports.awsAccountNetworkConfigSchema = exports.baseAccountNetworkConfigSchema.extend({
    providerName: zod_1.default.literal('AWS'),
    name: zod_1.default.string(),
    config: zod_1.default.object({
        vpcId: zod_1.default.string(),
        subnetIds: zod_1.default.array(zod_1.default.string()),
        securityGroupIds: zod_1.default.array(zod_1.default.string()),
    }),
});
exports.alicloudAccountNetworkConfigSchema = exports.baseAccountNetworkConfigSchema.extend({
    providerName: zod_1.default.literal('ALICLOUD'),
    name: zod_1.default.string(),
    config: zod_1.default.object({
        vpcId: zod_1.default.string(),
        subnetIds: zod_1.default.array(zod_1.default.string()),
        securityGroupIds: zod_1.default.array(zod_1.default.string()),
    }),
});
exports.gcpAccountNetworkConfigSchema = exports.baseAccountNetworkConfigSchema.extend({
    providerName: zod_1.default.literal('GCP'),
    name: zod_1.default.string(),
    config: zod_1.default.object({
        vpcName: zod_1.default.string(),
        subnetNames: zod_1.default.array(zod_1.default.string()),
        firewallTag: zod_1.default.array(zod_1.default.string()),
    }),
});
exports.accountNetworkConfigSchema = zod_1.default.union([exports.awsAccountNetworkConfigSchema, exports.alicloudAccountNetworkConfigSchema, exports.gcpAccountNetworkConfigSchema]);
