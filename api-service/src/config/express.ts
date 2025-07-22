import express, { Router } from 'express';
import pinoHttp from 'pino-http';
import compression from 'compression';
import logger from '@config/logger';
import healthRouter from '@routes/health-check';
import config from '@config/config';
import registerApiRoutes from '@helpers/bootstrap/dynamic-route';
import { default as configureCORS } from '@helpers/bootstrap/cors';
import handleGeneralExceptions from '@middlewares/exception-handler';
import { createBearerAuthMiddleware } from '@middlewares/token-auth';
import { tracingMiddleware } from '@middlewares/tracing-handler';
import { generateRequestId } from '@utils/api';
import session from 'express-session';
import { authMiddleware } from '@/middlewares/auth.middleware';

logger.info(`nodeEnv=${config.nodeEnv}`);

const app = express();
app.use(compression());
app.use(express.json({ limit: config.jsonLimit }));
app.use(express.urlencoded({ extended: true }));

// Configure session
const memoryStore = new session.MemoryStore();
app.use(
  session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  }),
);

// Middlewares
app.use(
  pinoHttp({
    logger,
    genReqId: generateRequestId,
    quietReqLogger: !logger.isLevelEnabled('debug'),
    quietResLogger: !logger.isLevelEnabled('debug'),
    serializers: {
      req: (req) => {
        // Remove sensitive information from request logging
        const { body, ...safeReq } = req;
        return safeReq;
      },
      res: (res) => {
        // Remove sensitive information from response logging
        const { body, ...safeRes } = res;
        return safeRes;
      },
    },
    autoLogging: {
      ignore: (req) => {
        // Ignore health check that are not logged
        return req.url.startsWith('/__health__') || req.url.startsWith('/health');
      },
    },
    customLogLevel: (_req, res, _err) => {
      if (res.statusCode >= 500) {
        return 'error';
      }

      if (res.statusCode >= 400) {
        return 'warn';
      }

      return 'info';
    },
  }),
);

app.use(tracingMiddleware);

// Static Routes
app.use('/health', healthRouter);

// CORS
configureCORS(app);

// auth middleware
// app.use(createBearerAuthMiddleware({ tokens: config.allowedTokens, ignorePaths: ['/api/health'] }));

// dynamic API Routes - all .routes.ts files in the routes directory will be registered here
const apiRouter = Router();
apiRouter.use(authMiddleware);
registerApiRoutes(apiRouter);

logger.info("Serving paths under '%s'", config.contextPath);
app.use(`${config.contextPath}/api`, apiRouter);

app.use(handleGeneralExceptions);

export default app;
