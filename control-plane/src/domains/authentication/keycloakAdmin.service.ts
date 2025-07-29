import { initKeycloakAdminClient } from '@/config/clients/keycloak-admin.client';
import config from '@/config/config';
import logger from '@/config/logger';

/**
 * Sets up a new realm for an account, including:
 * - Realm
 * - Identity Provider
 * - Default client
 * - IDP mappers
 */
export async function provisionNewRealm(accountUid: string) {
  const realmName = accountUid;
  const clientId = 'control-plane-ui';

  const kc = await initKeycloakAdminClient();

  // Step 1: Create Realm if not exists
  const existingRealms = await kc.realms.find();
  const realmExists = existingRealms.some((r) => r.realm === realmName);

  if (!realmExists) {
    logger.debug(`Creating realm: [${realmName}]`);
    await kc.realms.create({ realm: realmName, enabled: true });
  } else {
    logger.debug(`Realm [${realmName}] already exists, skipping.`);
  }

  kc.setConfig({ realmName });

  // Step 2: Create Identity Provider if not exists
  const idps = await kc.identityProviders.find({ realm: realmName });
  const idpExists = idps.some((idp) => idp.alias === 'global-users');

  if (!idpExists) {
    logger.debug(`Creating Identity Provider to [global-users]`);
    await kc.identityProviders.create({
      realm: realmName,
      alias: 'global-users',
      providerId: 'keycloak-oidc',
      enabled: true,
      config: {
        authorizationUrl: `${config.keycloak.issuer}/protocol/openid-connect/auth`,
        tokenUrl: `${config.keycloak.issuer}/protocol/openid-connect/token`,
        clientId: 'broker', // must match what's registered in global-users realm
        syncMode: 'IMPORT',
        useJwksUrl: 'true',
      },
    });
  } else {
    logger.debug(`Identity Provider [global-users] already exists in realm [${realmName}], skipping.`);
  }

  // Step 3: Create client for UI/backend access
  const existingClients = await kc.clients.find({ realm: realmName });
  const clientExists = existingClients.some((client) => client.clientId === clientId);

  if (!clientExists) {
    logger.debug(`Creating client [${clientId}] for realm [${realmName}]`);
    await kc.clients.create({
      realm: realmName,
      clientId,
      name: 'Control Plane UI',
      publicClient: true,
      redirectUris: [config.keycloak.redirectUri],
      webOrigins: [config.keycloak.webOrigin],
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: true,
    });
  } else {
    logger.debug(`Client [${clientId}] already exists in realm [${realmName}], skipping.`);
  }

  // Step 4: Create mappers for IDP (email, sub)
  const globalUsersIdP = (await kc.identityProviders.find({ realm: realmName })).find((idp) => idp.alias === 'global-users');

  if (globalUsersIdP) {
    const ensureMapper = async (name: string, claim: string) => {
      const mappers = await kc.identityProviders.findMappers({
        alias: globalUsersIdP.alias!,
      });

      const alreadyExists = mappers.some((m) => m.name === name);
      if (alreadyExists) {
        logger.debug(`Mapper [${name}] already exists, skipping.`);
        return;
      }

      logger.debug(`Creating mapper [${name}] for claim [${claim}] in realm [${realmName}]`);

      await kc.identityProviders.createMapper({
        alias: globalUsersIdP.alias!,
        identityProviderMapper: {
          name: name,
          identityProviderAlias: globalUsersIdP.alias!,
          identityProviderMapper: 'oidc-user-attribute-idp-mapper',
          config: {
            'user.attribute': name,
            claim: claim,
          },
        },
      });
    };

    await ensureMapper('email', 'email');
    await ensureMapper('sub', 'sub');
    // You can also add: await ensureMapper('name', 'name'); if needed
  } else {
    logger.warn(`Identity Provider [global-users] not found after creation step.`);
  }

  logger.info(`✅ Realm [${realmName}] provisioned.`);
}

export async function createRealmWithGlobalIdP(accountUid: string) {
  const kc = await initKeycloakAdminClient();
  const realmName = accountUid;

  // Step 1: Create Realm if not exists
  const existingRealms = await kc.realms.find();
  const realmExists = existingRealms.some((r) => r.realm === realmName);

  if (!realmExists) {
    logger.debug(`Creating realm: [${realmName}]`);
    await kc.realms.create({ realm: realmName, enabled: true });
  } else {
    logger.debug(`Realm [${realmName}] already exists, skipping.`);
  }

  // Change context to new realm
  kc.setConfig({ realmName });

  // Step 2: Create Identity Provider (to global-users realm)
  const idps = await kc.identityProviders.find({ realm: realmName });
  const idpExists = idps.some((idp) => idp.alias === 'global-users');

  if (!idpExists) {
    logger.debug(`Creating Identity Provider for [global-users]`);
    await kc.identityProviders.create({
      realm: realmName,
      alias: 'global-users',
      providerId: 'keycloak-oidc',
      enabled: true,
      config: {
        authorizationUrl: `${config.keycloak.issuer}/protocol/openid-connect/auth`,
        tokenUrl: `${config.keycloak.issuer}/protocol/openid-connect/token`,
        clientId: 'broker',
        syncMode: 'IMPORT',
        useJwksUrl: 'true',
      },
    });
  } else {
    logger.debug(`Identity Provider [global-users] already exists in realm [${realmName}], skipping.`);
  }
}

export async function finalizeRealmSetup(accountUid: string) {
  const realmName = accountUid;
  const kc = await initKeycloakAdminClient();

  // Switch to new realm
  kc.setConfig({ realmName });

  // Step 1: Create client for UI/backend access
  logger.debug('Create client for UI/backend access');
  const clientId = 'control-plane-ui';
  await kc.clients.create({
    clientId,
    name: 'Control Plane UI',
    publicClient: true,
    redirectUris: [config.keycloak.redirectUri],
    webOrigins: [config.keycloak.webOrigin],
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: true,
    realm: realmName,
  });

  // Step 2: Set up identity provider mappers
  logger.debug('Set up identity provider mappers');
  const idps = await kc.identityProviders.find();
  const globalUsersIdP = idps.find((idp) => idp.alias === 'global-users');

  if (globalUsersIdP) {
    await kc.identityProviders.createMapper({
      alias: globalUsersIdP.alias!,
      identityProviderMapper: {
        name: 'email',
        identityProviderMapper: 'oidc-user-attribute-idp-mapper',
        config: {
          'user.attribute': 'email',
          claim: 'email',
        },
      },
    });

    await kc.identityProviders.createMapper({
      alias: globalUsersIdP.alias!,
      identityProviderMapper: {
        name: 'sub',
        identityProviderMapper: 'oidc-user-attribute-idp-mapper',
        config: {
          'user.attribute': 'sub',
          claim: 'sub',
        },
      },
    });
  }

  // Step 3 (optional): Auto-create user in new realm (if not using broker sync)
  // Skipped if using broker with syncMode=IMPORT

  // Step 4: Optional - assign user to default role or group (e.g. admin)
}
