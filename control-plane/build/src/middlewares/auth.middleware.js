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
exports.authMiddleware = authMiddleware;
const jose_1 = require("jose");
const config_1 = __importDefault(require("@/config/config"));
const logger_1 = __importDefault(require("@/config/logger"));
const user_service_1 = require("@/domains/user/user.service");
// Keycloak settings
const JWKS = (0, jose_1.createRemoteJWKSet)(new URL(`${config_1.default.keycloak.issuer}/protocol/openid-connect/certs`));
const ISSUER = config_1.default.keycloak.issuer;
/**
 * Express middleware to authenticate requests using a Bearer JWT.
 *
 * - Verifies the token using JOSE and a JWKS key set.
 * - Attaches the raw JWT payload to `req.kcUser`.
 * - If `payload.sub` is present, looks up the user and sets `req.user`.
 * - For `/onboarding` paths, skips user lookup but still verifies token.
 * - Returns HTTP 401 for invalid, missing, or unverified tokens.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction to pass control
 */
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers.authorization;
            // Check if the Authorization header is present and properly formatted
            if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
                res.status(401).json({ message: 'Missing or malformed token' });
                return;
            }
            // Extract the token from the Authorization header
            const token = authHeader.split(' ')[1];
            // Verify and decode the JWT using JOSE
            const { payload } = yield (0, jose_1.jwtVerify)(token, JWKS, {
                issuer: ISSUER,
                // Optional: uncomment if you want to verify audience/client ID
                // audience: "control-plane-frontend",
            });
            // Attach the JWT payload to the request (for downstream use)
            req.kcUser = payload;
            // If no `sub` field is found in the payload, reject the request
            if (!payload.sub) {
                res.status(401).json({ message: 'Unauthorized. Missing subject in token' });
                return;
            }
            logger_1.default.debug(`payload.sub: ${payload.sub}`);
            // Allow token-only auth for onboarding route (skip user check)
            if (req.path.endsWith('onboarding')) {
                next();
            }
            else {
                // Lookup user from database using the sub field
                const user = yield (0, user_service_1.getInternalUserByKcSub)(payload.sub);
                // If no user found, reject the request
                if (!user) {
                    res.status(401).json({ message: 'Unauthorized. User not found' });
                    return;
                }
                // Attach the found user to the request
                req.user = user;
                // Proceed to next middleware
                next();
            }
        }
        catch (err) {
            // Catch and report any errors in token verification
            console.error('Token validation failed:', err);
            res.status(401).json({ message: 'Invalid token' });
        }
    });
}
