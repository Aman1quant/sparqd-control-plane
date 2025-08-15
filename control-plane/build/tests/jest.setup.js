"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./__mocks__/utils/api");
const logger_1 = require("../src/__mocks__/config/logger");
const redis_client_1 = require("./__mocks__/config/clients/redis.client");
jest.mock('snappy');
jest.mock('@config/logger', () => logger_1.mockLogger);
jest.mock('@config/clients/redis.client', () => redis_client_1.mockRedisClient);
jest.mock('@utils/api', () => ({
    createSuccessResponse: api_1.createSuccessResponse,
    createErrorResponse: api_1.createErrorResponse,
}));
