import { Router } from 'express';
import HealthCheckResponse from '@/models/api/health-check';
// import redisClient from '@config/clients/redis.client';

const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const response: HealthCheckResponse = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: {
      keycloak: 'unknown',
      redis: 'unknown',
    },
  };

  // try {
  //   // Check Redis
  //   await redisClient.ping();
  //   response.services.redis = 'ok';
  // } catch (error) {
  //   req.log.error(error, 'Redis health check failed');
  //   response.services.redis = 'error';
  //   response.status = 'error';
  // }

  res.status(response.status === 'ok' ? 200 : 503).json(response);
});

export default healthRouter;
