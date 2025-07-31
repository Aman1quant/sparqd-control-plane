import pino from 'pino';
import pinoCaller from 'pino-caller';
import config from './config';

let transport;

const isProduction = config.nodeEnv === 'production';
const isPinoMultiLine = process.env.PINO_MULTILINE === 'true';

if (!isProduction) {
  transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: !isPinoMultiLine,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}
console.log('config.logLevel', config.logLevel);
const baseLogger = pino({
  level: config.logLevel || 'info',
  useOnlyCustomLevels: false,
  customLevels: {
    metric: 25,
  },
  transport: !isProduction ? transport : undefined,
  redact: isProduction
    ? {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["set-cookie"]', 'res.headers["set-cookie"]'],
        censor: '[REDACTED]',
      }
    : undefined, // No redaction in development
}) as unknown as pino.Logger;

const logger = pinoCaller(baseLogger, { relativeTo: process.cwd() });

export default logger;
