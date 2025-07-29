export default interface HealthCheckResponse {
  status: 'ok' | 'error';
  uptime: number;
  timestamp: number;
  services: {
    keycloak: 'ok' | 'error' | 'unknown';
    redis: 'ok' | 'error' | 'unknown';
  };
}
