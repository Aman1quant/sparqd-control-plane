import type { NextFunction, Request, Response } from 'express';
import { Logger } from 'pino';

export const mockLogger = {
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    level: 'trace',
    fatal: jest.fn(),
    trace: jest.fn(),
    silent: jest.fn(),
    isLevelEnabled: jest.fn().mockReturnValue(true),
    child: jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      level: 'trace',
      fatal: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      child: jest.fn(),
    }),
  },
};

export function mockReqLogger(req: Request, _res: Response, next: NextFunction) {
  req.log = mockLogger.default as unknown as Logger;

  next();
}
