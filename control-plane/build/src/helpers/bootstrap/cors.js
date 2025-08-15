"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configure;
const config_1 = __importDefault(require("@config/config"));
const logger_1 = __importDefault(require("@config/logger"));
const cors_1 = __importDefault(require("cors"));
/**
 * Configures CORS middleware for the Express application.
 *
 * @param {Application} app - The Express application instance.
 */
function configure(app) {
    if (config_1.default.cors.enabled === false) {
        logger_1.default.warn('CORS is disabled in the configuration');
        return;
    }
    // Log the CORS configuration
    logger_1.default.info(`Configuring CORS with options: ${JSON.stringify(config_1.default.cors, null)}`);
    // Use the CORS middleware with the configured options
    const corsInstance = (0, cors_1.default)(config_1.default.cors);
    app.use(corsInstance);
}
