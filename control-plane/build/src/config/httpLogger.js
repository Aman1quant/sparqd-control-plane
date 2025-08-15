"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const enableHttpLogging = process.env.HTTP_LOGGING_ENABLED === 'true';
const isProduction = config_1.default.nodeEnv === 'production';
if (enableHttpLogging) {
    logger_1.default.info('HTTP Logging enabled');
}
else {
    logger_1.default.info('HTTP Logging disabled');
}
const transport = !isProduction
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            sync: true, // <-- flush logs immediately
            errorLikeObjectKeys: ['err', 'error'],
        },
    }
    : undefined;
const baseLogger = (0, pino_1.default)({
    level: config_1.default.logLevel || 'info',
    customLevels: { metric: 25 },
    useOnlyCustomLevels: false,
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["set-cookie"]', 'res.headers["set-cookie"]'],
        censor: '[REDACTED]',
    },
    transport,
});
const httpLogger = enableHttpLogging
    ? (0, pino_http_1.default)({
        logger: baseLogger,
        customSuccessMessage: (req, res) => `${req.method} ${req.originalUrl} ${res.statusCode}`,
        customErrorMessage: (req, res, err) => `${req.method} ${req.originalUrl} ${res.statusCode} - ${err.message}`,
    })
    : (_req, _res, next) => next(); // No-op
exports.default = httpLogger;
