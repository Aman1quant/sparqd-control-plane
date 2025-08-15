"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const pino_caller_1 = __importDefault(require("pino-caller"));
const config_1 = __importDefault(require("./config"));
const isProduction = config_1.default.nodeEnv === 'production';
const isPinoMultiLine = process.env.PINO_MULTILINE === 'true';
const transport = !isProduction
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            singleLine: !isPinoMultiLine,
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
    redact: isProduction
        ? {
            paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["set-cookie"]', 'res.headers["set-cookie"]'],
            censor: '[REDACTED]',
        }
        : undefined,
    transport,
});
const logger = (0, pino_caller_1.default)(baseLogger, { relativeTo: process.cwd() });
exports.default = logger;
