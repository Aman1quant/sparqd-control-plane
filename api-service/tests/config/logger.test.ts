jest.unmock('@config/logger'); // ignore global mock in jest.setup.ts

jest.mock('pino', () => {
  const mockFn = jest.fn().mockImplementation((options) => {
    // console.log('Pino called with options:', JSON.stringify(options, null, 2));
    return {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      level: options?.level || 'info',
      metric: jest.fn(),
    };
  });
  return mockFn;
});

describe('Logger', () => {
  const OLD_ENV = process.env;
  let pino: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    jest.clearAllMocks();
    pino = require('pino');
    // console.log('beforeEach: pino mock retrieved');
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should create a logger with default level "info" when LOG_LEVEL is not set', () => {
    delete process.env.LOG_LEVEL;

    require('@config/logger');

    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        customLevels: {
          metric: 25,
        },
      }),
    );
  });

  it('should use LOG_LEVEL from environment when set', () => {
    process.env.LOG_LEVEL = 'debug';

    require('@config/logger');

    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'debug',
        customLevels: {
          metric: 25,
        },
      }),
    );
  });

  it('should configure transport for non-production environment', () => {
    process.env.NODE_ENV = 'development';

    require('@config/logger');

    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({
        transport: expect.objectContaining({
          targets: [{ target: 'pino-pretty' }],
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }),
      }),
    );
  });

  it('should not configure transport for production environment', () => {
    process.env.NODE_ENV = 'production';

    require('@config/logger');

    expect(pino).toHaveBeenCalledWith(
      expect.not.objectContaining({
        transport: expect.anything(),
      }),
    );
  });
});
