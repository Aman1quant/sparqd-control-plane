import { createClient } from 'redis';
import config from '../config';
import { default as parentLogger } from '../logger';

const logger = parentLogger.child({ module: 'redis.client' });

const { host, port, password, maxRetries, retryDelay, connectTimeout } = config.redis;

const redisClient = createClient({
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

export default redisClient;
