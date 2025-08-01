import pino from 'pino';
import pinoCaller from 'pino-caller';
import config from './config';

const isProduction = config.nodeEnv === 'production';
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

const httpTransport = !isProduction
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
  redact: isProduction
    ? {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["set-cookie"]',
          'res.headers["set-cookie"]',
        ],
        censor: '[REDACTED]',
      }
    : undefined,
  transport,
}) as unknown as pino.Logger;


const logger = pinoCaller(baseLogger, { relativeTo: process.cwd() });

export default logger;
