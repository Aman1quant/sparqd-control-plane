import KcAdminClient from '@keycloak/keycloak-admin-client';
import config from '../config';

const kcAdmin = new KcAdminClient({
  baseUrl: `${config.keycloakAdmin.protocol}://${config.keycloakAdmin.host}:${config.keycloakAdmin.port}` || 'http://localhost:8080',
  realmName: 'platform'
});

export async function initKeycloakAdminClient(): Promise<KcAdminClient> {
  await kcAdmin.auth({
    grantType: 'password',
    clientId: 'admin-cli',
    username: config.keycloakAdmin.username || 'admin',
    password: config.keycloakAdmin.password || 'admin'
  });

  return kcAdmin;
}
