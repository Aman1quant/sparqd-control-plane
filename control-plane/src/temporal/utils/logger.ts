import pino from 'pino';

const transport = {
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

const logger = pino({
  level: 'info',
  transport,
}) as unknown as pino.Logger;

export default logger;
