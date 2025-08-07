import dotenv from 'dotenv';

dotenv.config();

import {
  Config,
  CORSConfig,
  KeycloakAdminConfig,
  KeycloakConfig,
  ProvisioningFreeTierAwsConfig,
  RedisConfig,
  SMTPConfig,
  TemporalConfig,
  TofuConfig,
} from '@models/config.model';

const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetries: Number(process.env.REDIS_MAX_RETRIES) || 3,
  retryDelay: Number(process.env.REDIS_RETRY_DELAY) || 3,
  connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT) || 5,
};

const keycloakConfig: KeycloakConfig = {
  issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/global-users',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'global-users',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'KEYCLOAK_CLIENT_SECRET',
  redirectUri: process.env.KEYCLOAK_REDIRECT_URI || 'http://localhost:5173/*',
  webOrigin: process.env.KEYCLOAK_WEBORIGIN || 'http://localhost:5173',
};

const keycloakAdminConfig: KeycloakAdminConfig = {
  host: process.env.KEYCLOAK_ADMIN_HOST || 'localhost',
  protocol: process.env.KEYCLOAK_ADMIN_PROTOCOL || 'https',
  port: Number(process.env.KEYCLOAK_ADMIN_PORT) || 443,
  username: process.env.KEYCLOAK_ADMIN_USERNAME || 'kcadmin',
  password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'kcadmin',
};

const corsOptions: CORSConfig = {
  enabled: process.env.CORS_ENABLED === 'true',
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(','),
  credentials: process.env.CORS_ALLOW_CREDENTIALS === 'true',
  methods: process.env.CORS_ALLOWED_METHODS?.split(','),
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(','),
  exposedHeaders: process.env.CORS_EXPOSED_HEADERS?.split(','),
  maxAge: process.env.CORS_MAX_AGE ? Number(process.env.CORS_MAX_AGE) : undefined,
  optionsSuccessStatus: process.env.CORS_OPTIONS_SUCCESS_STATUS ? Number(process.env.CORS_OPTIONS_SUCCESS_STATUS) : undefined,
};

const smtpConfig: SMTPConfig = {
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

const temporalConfig: TemporalConfig = {
  address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  namespace: process.env.TEMPORAL_NAMESPACE || 'default',
};

const tofuConfig: TofuConfig = {
  tofuTemplateDir: process.env.TOFU_TEMPLATE_DIR || '~/tofu-template',
};

const provisioningFreeTierAwsConfig: ProvisioningFreeTierAwsConfig = {
  defaultRegion: process.env.PROVISIONING_FREE_TIER_AWS_DEFAULT_REGION || 'ap-southeast-1',
  s3Bucket: process.env.PROVISIONING_FREE_TIER_AWS_S3_BUCKET || 'my-bucket',
  vpcId: process.env.PROVISIONING_FREE_TIER_AWS_VPC_ID || 'vpc-111222333',
  subnetIds: process.env.PROVISIONING_FREE_TIER_AWS_SUBNET_IDS?.split(',') || [],
  securityGroupIds: process.env.PROVISIONING_FREE_TIER_AWS_SECURITY_GROUP_IDS?.split(',') || [],
};

const config: Config = {
  listenPort: Number(process.env.LISTEN_PORT) || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  contextPath: process.env.CONTEXT_PATH || '',
  jsonLimit: process.env.JSON_LIMIT || '10mb',
  allowedTokens: process.env.ALLOWED_TOKENS?.split(',') ?? [],
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

export default config;
