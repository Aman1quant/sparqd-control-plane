import dotenv from 'dotenv';
import { Config, RedisConfig, CORSConfig, KeycloakAdminConfig } from '@models/config.model';
import logger from '@config/logger';

const env = dotenv.config();

if (env.error) {
  if ('code' in env.error && env.error.code === 'ENOENT') {
    logger.info('No .env file found, using environment variables from system');
  } else {
    logger.error({ err: env.error }, 'Error loading .env file: %o', env.error);
    throw new Error(`Failed to load environment variables: ${env.error.message}`);
  }
} else {
  logger.info('.env file loaded successfully');
}

const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetries: Number(process.env.REDIS_MAX_RETRIES) || 3,
  retryDelay: Number(process.env.REDIS_RETRY_DELAY) || 3,
  connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT) || 5,
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

const config: Config = {
  listenPort: Number(process.env.LISTEN_PORT) || 3000,
  contextPath: process.env.CONTEXT_PATH || '',
  jsonLimit: process.env.JSON_LIMIT || '10mb',
  allowedTokens: process.env.ALLOWED_TOKENS?.split(',') ?? [],
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: corsOptions,
  redis: redisConfig,
  keycloakAdmin: keycloakAdminConfig,
  masterRealm: 'master',
  controlPlaneClient: 'controlplane',
  controlPlaneRedirectURI: process.env.CONTROL_PLANE_REDIRECT_URI || 'http://localhost:3000/*',
};

export default config;
