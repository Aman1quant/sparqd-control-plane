import pino from 'pino';
import dotenv from 'dotenv';

let transport;
const env = dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
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
});

export default logger;
