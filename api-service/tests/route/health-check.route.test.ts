import request from 'supertest';
import express from 'express';
import healthRouter from '@routes/health-check';
import redisClient from '@config/clients/redis.client';
import { mockReqLogger } from '../__mocks__/config/logger';

const app = express();

app.use(mockReqLogger);
app.use('/', healthRouter);

describe('Health Check Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    // Close any open connections or streams
    // const redisClient = require('@config/clients/redis.client');
    // redisClient.disconnect();
  });

  it('should return ok status when all services are healthy', async () => {
    (redisClient.ping as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.services.opensearch).toBe('ok');
    expect(response.body.services.redis).toBe('ok');
  });

  it('should return error status when OpenSearch is unhealthy', async () => {
    (redisClient.ping as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).get('/');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('error');
    expect(response.body.services.opensearch).toBe('error');
    expect(response.body.services.redis).toBe('ok');
  });

  it('should return error status when Redis is unhealthy', async () => {
    (redisClient.ping as jest.Mock).mockRejectedValue(new Error('Redis error'));

    const response = await request(app).get('/');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('error');
    expect(response.body.services.opensearch).toBe('ok');
    expect(response.body.services.redis).toBe('error');
  });

  it('should return error status when both services are unhealthy', async () => {
    (redisClient.ping as jest.Mock).mockRejectedValue(new Error('Redis error'));

    const response = await request(app).get('/');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('error');
    expect(response.body.services.opensearch).toBe('error');
    expect(response.body.services.redis).toBe('error');
  });
});
