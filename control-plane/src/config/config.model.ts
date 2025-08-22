export interface RedisConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  maxRetries: number;
  retryDelay: number;
  connectTimeout: number;
}

export interface KeycloakConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  webOrigin: string;
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

export interface TemporalConfig {
  address: string;
  namespace: string;
}

export interface TofuConfig {
  tofuTemplateDir: string;
}

export interface ProvisioningFreeTierAwsConfig {
  defaultRegion: string;
  s3Bucket: string;
  vpcId: string;
  subnetIds: string[];
  securityGroupIds: string[];
  eks_cluster_name: string;
}

export interface Config {
  listenPort: number;
  logLevel: string;
  jsonLimit: string;
  allowedTokens: string[];

  nodeEnv: string;
  cors: CORSConfig;
  smtp: SMTPConfig;

  redis: RedisConfig;
  keycloak: KeycloakConfig;
  keycloakAdmin: KeycloakAdminConfig;
  systemUserEmail: string;

  masterRealm: string;
  controlPlaneClient: string;
  controlPlaneRedirectURI: string;

  temporal: TemporalConfig;
  tofu: TofuConfig;
  provisioningFreeTierAWS: ProvisioningFreeTierAwsConfig;
}
