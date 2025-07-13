const mockDotenvConfig = jest.fn();
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

jest.mock('dotenv', () => ({
  __esModule: true,
  default: {
    config: mockDotenvConfig,
  },
}));
jest.mock('@config/logger', () => ({
  __esModule: true,
  default: mockLogger,
}));

describe('Config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    mockDotenvConfig.mockClear();
    mockLogger.info.mockClear();
    mockLogger.error.mockClear();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should throw an error if dotenv.config() returns an error other than ENOENT', () => {
    const mockError = new Error('Test error');
    mockDotenvConfig.mockReturnValue({ error: mockError });

    expect(() => {
      require('@config/config');
    }).toThrow('Failed to load environment variables: Test error');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should use default values when environment variables are not set', () => {
    mockDotenvConfig.mockReturnValue({ parsed: {} });
    const config = require('@config/config').default;

    expect(config.listenPort).toBe(3000);
    expect(config.redis.port).toBe(6379);
  });

  it('should log an info message when ENOENT error occurs', () => {
    const mockError = new Error('ENOENT: no such file or directory');
    (mockError as any).code = 'ENOENT';
    mockDotenvConfig.mockReturnValue({ error: mockError });

    require('@config/config');

    expect(mockLogger.info).toHaveBeenCalledWith('No .env file found, using environment variables from system');
  });

  it('should log an info message when .env is loaded successfully', () => {
    mockDotenvConfig.mockReturnValue({ parsed: { LISTEN_PORT: '8080' } });

    require('@config/config');

    expect(mockLogger.info).toHaveBeenCalledWith('.env file loaded successfully');
  });
});
