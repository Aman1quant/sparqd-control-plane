"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blocked_at_1 = __importDefault(require("blocked-at"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ module: 'block-detection' });
function setupBlockDetection() {
    logger.debug('Setting up block detection');
    (0, blocked_at_1.default)((time, stack, { type, resource }) => {
        logger.warn(`Blocked for ${time}ms, operation started here: %s`, stack);
        if (type === 'HTTPPARSER' && resource) {
            logger.warn(`URL related to blocking operation: ${resource.resource.incoming.url}`);
        }
    }, { resourcesCap: 100, threshold: 200 });
    return;
}
exports.default = setupBlockDetection;
