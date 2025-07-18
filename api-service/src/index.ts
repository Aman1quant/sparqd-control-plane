import prexit from 'prexit';
// import setupBlockDetection from './helpers/bootstrap/blocked';
import config from '@/config/config';
import http from 'http';
import app from './config/express';
import logger from './config/logger';
import { default as redisClient } from '@config/clients/redis.client';

// setupBlockDetection();

logger.info('Server starting. Attempting to listen on port: %s', config.listenPort);

const server = http.createServer(app);

server.listen(config.listenPort, () => {
  logger.info('HTTP Server listening on port: %s, in %s mode', config.listenPort, config.nodeEnv);
});

// handle graceful shutdown
prexit(async () => {
  await new Promise((r) => server.close(r));
  logger.info('HTTP Server closed');
  logger.info('Closing clients.');

  await redisClient.close();
  logger.info('Redis client closed');
});
