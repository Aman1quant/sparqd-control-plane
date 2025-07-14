import pino from 'pino';
import dotenv from 'dotenv';

let transport;
const env = dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  transport = {
    targets: [{ target: 'pino-pretty' }],
    options: {
      colorize: true,
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
  transport,
});

export default logger;
