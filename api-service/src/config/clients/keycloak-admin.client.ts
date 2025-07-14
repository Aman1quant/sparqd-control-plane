import KcAdminClient from '@keycloak/keycloak-admin-client';
import config from '@/config/config';

const kcAdmin = new KcAdminClient({
  baseUrl: `${config.keycloakAdmin.protocol}://${config.keycloakAdmin.host}:${config.keycloakAdmin.port}` || 'http://localhost:8080',
  realmName: config.masterRealm,
});

export async function initKeycloakAdminClient(): Promise<KcAdminClient> {
  await kcAdmin.auth({
    grantType: 'password',
    clientId: 'admin-cli',
    username: config.keycloakAdmin.username || 'kcadmin',
    password: config.keycloakAdmin.password || 'kcadmin',
  });

  return kcAdmin;
}
