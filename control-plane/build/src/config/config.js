"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    maxRetries: Number(process.env.REDIS_MAX_RETRIES) || 3,
    retryDelay: Number(process.env.REDIS_RETRY_DELAY) || 3,
    connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT) || 5,
};
const keycloakConfig = {
    issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/global-users',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'global-users',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'KEYCLOAK_CLIENT_SECRET',
    redirectUri: process.env.KEYCLOAK_REDIRECT_URI || 'http://localhost:5173/*',
    webOrigin: process.env.KEYCLOAK_WEBORIGIN || 'http://localhost:5173',
};
const keycloakAdminConfig = {
    host: process.env.KEYCLOAK_ADMIN_HOST || 'localhost',
    protocol: process.env.KEYCLOAK_ADMIN_PROTOCOL || 'https',
    port: Number(process.env.KEYCLOAK_ADMIN_PORT) || 443,
    username: process.env.KEYCLOAK_ADMIN_USERNAME || 'kcadmin',
    password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'kcadmin',
};
const corsOptions = {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: (_a = process.env.CORS_ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(','),
    credentials: process.env.CORS_ALLOW_CREDENTIALS === 'true',
    methods: (_b = process.env.CORS_ALLOWED_METHODS) === null || _b === void 0 ? void 0 : _b.split(','),
    allowedHeaders: (_c = process.env.CORS_ALLOWED_HEADERS) === null || _c === void 0 ? void 0 : _c.split(','),
    exposedHeaders: (_d = process.env.CORS_EXPOSED_HEADERS) === null || _d === void 0 ? void 0 : _d.split(','),
    maxAge: process.env.CORS_MAX_AGE ? Number(process.env.CORS_MAX_AGE) : undefined,
    optionsSuccessStatus: process.env.CORS_OPTIONS_SUCCESS_STATUS ? Number(process.env.CORS_OPTIONS_SUCCESS_STATUS) : undefined,
};
const smtpConfig = {
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    from: process.env.SMTP_MAIL_FROM || 'noreply@example.com',
    starttls: {
        enabled: process.env.SMTP_STARTTLS === 'true',
    },
    ssl: process.env.SMTP_SSL === 'true',
};
const temporalConfig = {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
};
const tofuConfig = {
    tofuTemplateDir: process.env.TOFU_TEMPLATE_DIR || '~/tofu-template',
};
const provisioningFreeTierAwsConfig = {
    defaultRegion: process.env.PROVISIONING_FREE_TIER_AWS_DEFAULT_REGION || 'ap-southeast-1',
    s3Bucket: process.env.PROVISIONING_FREE_TIER_AWS_S3_BUCKET || 'my-bucket',
    vpcId: process.env.PROVISIONING_FREE_TIER_AWS_VPC_ID || 'vpc-111222333',
    subnetIds: ((_e = process.env.PROVISIONING_FREE_TIER_AWS_SUBNET_IDS) === null || _e === void 0 ? void 0 : _e.split(',')) || [],
    securityGroupIds: ((_f = process.env.PROVISIONING_FREE_TIER_AWS_SECURITY_GROUP_IDS) === null || _f === void 0 ? void 0 : _f.split(',')) || [],
    eks_cluster_name: process.env.PROVISIONING_FREE_TIER_AWS_EKS_CLUSTER_NAME || 'free-eks-cluster',
};
const config = {
    listenPort: Number(process.env.LISTEN_PORT) || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
    contextPath: process.env.CONTEXT_PATH || '',
    jsonLimit: process.env.JSON_LIMIT || '10mb',
    allowedTokens: (_h = (_g = process.env.ALLOWED_TOKENS) === null || _g === void 0 ? void 0 : _g.split(',')) !== null && _h !== void 0 ? _h : [],
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: corsOptions,
    redis: redisConfig,
    systemUserEmail: process.env.SYSTEM_USER_EMAIL || 'system@quant-data.io',
    keycloak: keycloakConfig,
    keycloakAdmin: keycloakAdminConfig,
    masterRealm: 'master',
    controlPlaneClient: 'controlplane',
    controlPlaneRedirectURI: process.env.CONTROL_PLANE_REDIRECT_URI || 'http://localhost:3000/*',
    smtp: smtpConfig,
    temporal: temporalConfig,
    tofu: tofuConfig,
    provisioningFreeTierAWS: provisioningFreeTierAwsConfig,
};
exports.default = config;
