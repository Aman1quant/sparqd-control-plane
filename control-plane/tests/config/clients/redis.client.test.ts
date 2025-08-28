jest.unmock('@config/clients/redis.client');
jest.unmock('@config/logger'); // ignore global mock in jest.setup.ts

import { createClient } from 'redis';

jest.mock('redis');
jest.mock('../../../src/config/config', () => ({
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'test-password',
    maxRetries: 3,
    retryDelay: 1,
    connectTimeout: 5,
  },
}));

const mockLoggerFunctions = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

jest.mock('pino', () => {
  return jest.fn().mockImplementation(() => ({
    child: () => mockLoggerFunctions,
    ...mockLoggerFunctions,
  }));
});

describe('Redis Client', () => {
  let mockRedisClient: { on: jest.Mock; connect: jest.Mock };
  let mockOn: jest.Mock;
  let mockConnect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOn = jest.fn().mockImplementation((event, handler) => {
      if (event === 'error') {
        handler(new Error('Redis connection error'));
      }
    });
    mockConnect = jest.fn().mockResolvedValue(undefined);
    mockRedisClient = {
      on: mockOn,
      connect: mockConnect,
    };
    (createClient as jest.Mock).mockReturnValue(mockRedisClient);

    jest.isolateModules(() => {
      require('@config/clients/redis.client');
    });
  });

  it('should create redis client with correct config', () => {
    expect(createClient).toHaveBeenCalledWith({
      socket: {
        host: 'localhost',
        port: 6379,
        connectTimeout: 5000,
        keepAlive: true,
        reconnectStrategy: expect.any(Function),
      },
      password: 'test-password',
    });
  });

  it('should handle reconnection strategy correctly', () => {
    const { reconnectStrategy } = (createClient as jest.Mock).mock.calls[0][0].socket;

    expect(reconnectStrategy(1)).toBe(1000);
    expect(reconnectStrategy(2)).toBe(1000);

    const error = reconnectStrategy(4);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Redis connection failed after 3 retries');
    expect(mockLoggerFunctions.error).toHaveBeenCalledWith('Redis connection failed after 3 retries');
  });

  it('should register error event handler', () => {
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockLoggerFunctions.error).toHaveBeenCalledWith({ err: expect.any(Error) }, 'Redis connection error');
  });

  it('should attempt to connect', () => {
    expect(mockConnect).toHaveBeenCalled();
  });

  it('should handle successful connection', async () => {
    await mockRedisClient.connect();
    expect(mockLoggerFunctions.info).toHaveBeenCalledWith('✅ Redis client connected');
  });

  it('should handle connection failure', async () => {
    const error = new Error('Connection failed');
    mockConnect.mockRejectedValueOnce(error);

    require('@config/clients/redis.client');

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockLoggerFunctions.error).toHaveBeenCalledWith({ err: error }, '❌ Redis connection failed');
  });
});
