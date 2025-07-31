import express from 'express';
import pinoHttp from 'pino-http';
import compression from 'compression';
import logger from '@config/logger';
import healthRouter from '@routes/health-check';
import config from '@config/config';
import { default as configureCORS } from '@helpers/bootstrap/cors';
import handleGeneralExceptions from '@middlewares/exception-handler';
import { tracingMiddleware } from '@middlewares/tracing-handler';
import { generateRequestId } from '@utils/api';
import helmet from 'helmet';
import session from 'express-session';
import v1Router from '@routes/v1';

const app = express();
app.use(compression());
app.use(express.json({ limit: config.jsonLimit }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

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

logger.info("Serving paths under '%s'", config.contextPath);
// app.use(`${config.contextPath}/api`, apiRouter);

app.use('/api/v1', v1Router);
logger.debug('✅ Manual debug log works');
app.use(handleGeneralExceptions);

export default app;
