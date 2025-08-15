"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("@config/logger"));
const api_1 = require("@utils/api");
function handleGeneralExceptions(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    const logger = req.log || logger_1.default;
    logger.error({ err, module: 'global-exception-handler' }, 'Uncaught exception occurred');
    res.status(500).json((0, api_1.createErrorResponse)('An unknown exception has occurred: ', err.message));
}
exports.default = handleGeneralExceptions;
