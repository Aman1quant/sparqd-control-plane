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
exports.initKeycloakAdminClient = initKeycloakAdminClient;
const keycloak_admin_client_1 = __importDefault(require("@keycloak/keycloak-admin-client"));
const config_1 = __importDefault(require("@/config/config"));
const logger_1 = __importDefault(require("@/config/logger"));
function initKeycloakAdminClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const kcAdmin = new keycloak_admin_client_1.default({
            baseUrl: `${config_1.default.keycloakAdmin.protocol}://${config_1.default.keycloakAdmin.host}:${config_1.default.keycloakAdmin.port}` || 'http://localhost:8080',
            realmName: config_1.default.masterRealm,
        });
        logger_1.default.debug(`Authenticating with Keycloak admin...`);
        yield kcAdmin.auth({
            grantType: 'password',
            clientId: 'admin-cli',
            username: config_1.default.keycloakAdmin.username || 'kcadmin',
            password: config_1.default.keycloakAdmin.password || 'kcadmin',
        });
        logger_1.default.debug(`Authenticated.`);
        return kcAdmin;
    });
}
