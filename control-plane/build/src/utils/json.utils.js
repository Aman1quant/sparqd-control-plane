"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJsonParse = safeJsonParse;
const request_context_1 = require("@/helpers/request-context");
function safeJsonParse(data, fallback) {
    if (!data)
        return fallback;
    try {
        return JSON.parse(data);
    }
    catch (error) {
        const logger = (0, request_context_1.getRequestLogger)();
        logger.error({ error, data }, 'Failed to parse JSON');
        return fallback;
    }
}
