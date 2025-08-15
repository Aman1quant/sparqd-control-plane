"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const logger = logger_1.default.child({ module: 'redis.client' });
const { host, port, password, maxRetries, retryDelay, connectTimeout } = config_1.default.redis;
const redisClient = (0, redis_1.createClient)({
    socket: {
        host,
        port,
        connectTimeout: connectTimeout * 1000,
        keepAlive: true,
        reconnectStrategy: (retries) => {
            if (retries > maxRetries) {
                logger.error(`Redis connection failed after ${maxRetries} retries`);
                return new Error(`Redis connection failed after ${maxRetries} retries`);
            }
            return Math.min(retries * 1000, retryDelay * 1000);
        },
    },
    password,
});
redisClient.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
});
// redisClient.on('reconnecting', () => {
//   logger.warn('🔄 Redis reconnecting...');
// });
redisClient
    .connect()
    .then(() => logger.info('✅ Redis client connected'))
    .catch((err) => logger.error({ err }, '❌ Redis connection failed'));
exports.default = redisClient;
