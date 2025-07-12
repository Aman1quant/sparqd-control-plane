import pino from 'pino';

let transport;

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
