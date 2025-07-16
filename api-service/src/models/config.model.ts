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

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user?: string;
    pass?: string;
  };
  starttls: {
    enabled: boolean;
  };
  ssl?: boolean;
  from: string;
}

export interface Config {
  listenPort: number;
  contextPath: string;
  jsonLimit: string;
  allowedTokens: string[];

  nodeEnv: string;
  cors: CORSConfig;
  smtp: SMTPConfig;

  redis: RedisConfig;
  keycloakAdmin: KeycloakAdminConfig;

  masterRealm: string;
  controlPlaneClient: string;
  controlPlaneRedirectURI: string;
}
