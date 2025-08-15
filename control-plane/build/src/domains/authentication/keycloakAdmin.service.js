"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.provisionNewRealm = provisionNewRealm;
exports.createRealmWithGlobalIdP = createRealmWithGlobalIdP;
exports.finalizeRealmSetup = finalizeRealmSetup;
const keycloak_admin_client_1 = require("@/config/clients/keycloak-admin.client");
const config_1 = __importDefault(require("@/config/config"));
const logger_1 = __importDefault(require("@/config/logger"));
/**
 * Sets up a new realm for an account, including:
 * - Realm
 * - Identity Provider
 * - Default client
 * - IDP mappers
 */
function provisionNewRealm(accountUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const realmName = accountUid;
        const clientId = 'control-plane-ui';
        const kc = yield (0, keycloak_admin_client_1.initKeycloakAdminClient)();
        // Step 1: Create Realm if not exists
        const existingRealms = yield kc.realms.find();
        const realmExists = existingRealms.some((r) => r.realm === realmName);
        if (!realmExists) {
            logger_1.default.debug(`Creating realm: [${realmName}]`);
            yield kc.realms.create({ realm: realmName, enabled: true });
        }
        else {
            logger_1.default.debug(`Realm [${realmName}] already exists, skipping.`);
        }
        kc.setConfig({ realmName });
        // Step 2: Create Identity Provider if not exists
        const idps = yield kc.identityProviders.find({ realm: realmName });
        const idpExists = idps.some((idp) => idp.alias === 'global-users');
        if (!idpExists) {
            logger_1.default.debug(`Creating Identity Provider to [global-users]`);
            yield kc.identityProviders.create({
                realm: realmName,
                alias: 'global-users',
                providerId: 'keycloak-oidc',
                enabled: true,
                config: {
                    authorizationUrl: `${config_1.default.keycloak.issuer}/protocol/openid-connect/auth`,
                    tokenUrl: `${config_1.default.keycloak.issuer}/protocol/openid-connect/token`,
                    clientId: 'broker', // must match what's registered in global-users realm
                    syncMode: 'IMPORT',
                    useJwksUrl: 'true',
                },
            });
        }
        else {
            logger_1.default.debug(`Identity Provider [global-users] already exists in realm [${realmName}], skipping.`);
        }
        // Step 3: Create client for UI/backend access
        const existingClients = yield kc.clients.find({ realm: realmName });
        const clientExists = existingClients.some((client) => client.clientId === clientId);
        if (!clientExists) {
            logger_1.default.debug(`Creating client [${clientId}] for realm [${realmName}]`);
            yield kc.clients.create({
                realm: realmName,
                clientId,
                name: 'Control Plane UI',
                publicClient: true,
                redirectUris: [config_1.default.keycloak.redirectUri],
                webOrigins: [config_1.default.keycloak.webOrigin],
                standardFlowEnabled: true,
                implicitFlowEnabled: false,
                directAccessGrantsEnabled: true,
            });
        }
        else {
            logger_1.default.debug(`Client [${clientId}] already exists in realm [${realmName}], skipping.`);
        }
        // Step 4: Create mappers for IDP (email, sub)
        const globalUsersIdP = (yield kc.identityProviders.find({ realm: realmName })).find((idp) => idp.alias === 'global-users');
        if (globalUsersIdP) {
            const ensureMapper = (name, claim) => __awaiter(this, void 0, void 0, function* () {
                const mappers = yield kc.identityProviders.findMappers({
                    alias: globalUsersIdP.alias,
                });
                const alreadyExists = mappers.some((m) => m.name === name);
                if (alreadyExists) {
                    logger_1.default.debug(`Mapper [${name}] already exists, skipping.`);
                    return;
                }
                logger_1.default.debug(`Creating mapper [${name}] for claim [${claim}] in realm [${realmName}]`);
                yield kc.identityProviders.createMapper({
                    alias: globalUsersIdP.alias,
                    identityProviderMapper: {
                        name: name,
                        identityProviderAlias: globalUsersIdP.alias,
                        identityProviderMapper: 'oidc-user-attribute-idp-mapper',
                        config: {
                            'user.attribute': name,
                            claim: claim,
                        },
                    },
                });
            });
            yield ensureMapper('email', 'email');
            yield ensureMapper('sub', 'sub');
            // You can also add: await ensureMapper('name', 'name'); if needed
        }
        else {
            logger_1.default.warn(`Identity Provider [global-users] not found after creation step.`);
        }
        logger_1.default.info(`✅ Realm [${realmName}] provisioned.`);
    });
}
function createRealmWithGlobalIdP(accountUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const kc = yield (0, keycloak_admin_client_1.initKeycloakAdminClient)();
        const realmName = accountUid;
        // Step 1: Create Realm if not exists
        const existingRealms = yield kc.realms.find();
        const realmExists = existingRealms.some((r) => r.realm === realmName);
        if (!realmExists) {
            logger_1.default.debug(`Creating realm: [${realmName}]`);
            yield kc.realms.create({ realm: realmName, enabled: true });
        }
        else {
            logger_1.default.debug(`Realm [${realmName}] already exists, skipping.`);
        }
        // Change context to new realm
        kc.setConfig({ realmName });
        // Step 2: Create Identity Provider (to global-users realm)
        const idps = yield kc.identityProviders.find({ realm: realmName });
        const idpExists = idps.some((idp) => idp.alias === 'global-users');
        if (!idpExists) {
            logger_1.default.debug(`Creating Identity Provider for [global-users]`);
            yield kc.identityProviders.create({
                realm: realmName,
                alias: 'global-users',
                providerId: 'keycloak-oidc',
                enabled: true,
                config: {
                    authorizationUrl: `${config_1.default.keycloak.issuer}/protocol/openid-connect/auth`,
                    tokenUrl: `${config_1.default.keycloak.issuer}/protocol/openid-connect/token`,
                    clientId: 'broker',
                    syncMode: 'IMPORT',
                    useJwksUrl: 'true',
                },
            });
        }
        else {
            logger_1.default.debug(`Identity Provider [global-users] already exists in realm [${realmName}], skipping.`);
        }
    });
}
function finalizeRealmSetup(accountUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const realmName = accountUid;
        const kc = yield (0, keycloak_admin_client_1.initKeycloakAdminClient)();
        // Switch to new realm
        kc.setConfig({ realmName });
        // Step 1: Create client for UI/backend access
        logger_1.default.debug('Create client for UI/backend access');
        const clientId = 'control-plane-ui';
        yield kc.clients.create({
            clientId,
            name: 'Control Plane UI',
            publicClient: true,
            redirectUris: [config_1.default.keycloak.redirectUri],
            webOrigins: [config_1.default.keycloak.webOrigin],
            standardFlowEnabled: true,
            implicitFlowEnabled: false,
            directAccessGrantsEnabled: true,
            realm: realmName,
        });
        // Step 2: Set up identity provider mappers
        logger_1.default.debug('Set up identity provider mappers');
        const idps = yield kc.identityProviders.find();
        const globalUsersIdP = idps.find((idp) => idp.alias === 'global-users');
        if (globalUsersIdP) {
            yield kc.identityProviders.createMapper({
                alias: globalUsersIdP.alias,
                identityProviderMapper: {
                    name: 'email',
                    identityProviderMapper: 'oidc-user-attribute-idp-mapper',
                    config: {
                        'user.attribute': 'email',
                        claim: 'email',
                    },
                },
            });
            yield kc.identityProviders.createMapper({
                alias: globalUsersIdP.alias,
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
    });
}
