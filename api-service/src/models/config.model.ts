export interface RedisConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  maxRetries: number;
  retryDelay: number;
  connectTimeout: number;
}

export interface KeycloakAdminConfig {
  host: string;
  protocol: string;
  port: number;
  username: string;
  password: string;
}

export interface CORSConfig {
  enabled: boolean;
  origin?: string[];
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  optionsSuccessStatus?: number;
}

export interface Config {
  listenPort: number;
  contextPath: string;
  jsonLimit: string;
  allowedTokens: string[];

  nodeEnv: string;
  cors: CORSConfig;

  redis: RedisConfig;
  keycloakAdmin: KeycloakAdminConfig;
}
