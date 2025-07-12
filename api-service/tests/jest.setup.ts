import { createSuccessResponse, createErrorResponse } from './__mocks__/utils/api';
import { mockLogger } from './__mocks__/config/logger';
import { mockRedisClient } from './__mocks__/config/clients/redis.client';

jest.mock('snappy');

jest.mock('@config/logger', () => mockLogger);
jest.mock('@config/clients/redis.client', () => mockRedisClient);

jest.mock('@utils/api', () => ({
  createSuccessResponse,
  createErrorResponse,
}));
