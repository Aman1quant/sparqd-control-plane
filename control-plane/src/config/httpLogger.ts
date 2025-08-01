import pinoHttp from 'pino-http';
import logger from './logger';
import { RequestHandler } from 'express';
import pino from 'pino';
import config from './config';

const enableHttpLogging = process.env.HTTP_LOGGING_ENABLED === 'true';
const isProduction = config.nodeEnv === 'production';

if (enableHttpLogging) {
  logger.info('HTTP Logging enabled');
} else {
  logger.info('HTTP Logging disabled');
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

const baseLogger = pino({
  level: config.logLevel || 'info',
  customLevels: { metric: 25 },
  useOnlyCustomLevels: false,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["set-cookie"]', 'res.headers["set-cookie"]'],
    censor: '[REDACTED]',
  },
  transport,
}) as unknown as pino.Logger;

const httpLogger: RequestHandler = enableHttpLogging
  ? pinoHttp({
      logger: baseLogger,
      customSuccessMessage: (req, res) => `${req.method} ${req.originalUrl} ${res.statusCode}`,
      customErrorMessage: (req, res, err) => `${req.method} ${req.originalUrl} ${res.statusCode} - ${err.message}`,
    })
  : (_req, _res, next) => next(); // No-op

export default httpLogger;
