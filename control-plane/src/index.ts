import dotenv from 'dotenv';

const env = dotenv.config();

import http from 'http';
import prexit from 'prexit';

import logger from './config/logger';

console.log(`-------------------------------------------------------------------------------------------
`);

if (env.error) {
  if ('code' in env.error && env.error.code === 'ENOENT') {
    logger.info('No .env file found, using environment variables from system');
  } else {
    logger.error({ err: env.error }, 'Error loading .env file: %o', env.error);
    throw new Error(`Failed to load environment variables: ${env.error.message}`);
  }
} else {
  logger.info('.env file loaded successfully');
}

import config from '@/config/config';

import app from './app';

const server = http.createServer(app);

server.listen(config.listenPort, () => {
  logger.info('HTTP Server listening on port: %s, in %s mode', config.listenPort, config.nodeEnv);
});

const welcomeMessage = `


********************************************************************
🛰️   Welcome to SPARQD Control Plane
--------------------------------------------------------------------
📦  Environment   : ${process.env.NODE_ENV || 'development'}
🔧  Log Level     : ${process.env.LOG_LEVEL || 'info'}
🔧  HTTP logging  : ${process.env.HTTP_LOGGING_ENABLED || 'false'}
🌐  Listening on  : http://localhost:3000
📅  Started at    : ${new Date().toLocaleString()}
********************************************************************
`;
logger.info(welcomeMessage);

// handle graceful shutdown
prexit(async () => {
  await new Promise((r) => server.close(r));
  logger.info('HTTP Server closed');
  logger.info('Closing clients.');
});
