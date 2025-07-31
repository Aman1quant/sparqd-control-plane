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
const logHttpTraffic = config.logLevel === 'debug';
app.use(
  pinoHttp({
    logger,
    genReqId: generateRequestId,
    // quietReqLogger: !logHttpTraffic,
    // quietResLogger: !logHttpTraffic,
    // serializers: {
    //   req: (req) => ({
    //     method: req.method,
    //     url: req.url,
    //     headers: {
    //       ...req.headers,
    //       authorization: undefined,
    //       cookie: undefined,
    //     },
    //     remoteAddress: req.socket?.remoteAddress,
    //     remotePort: req.socket?.remotePort,
    //   }),
    //   res: (res) => ({
    //     statusCode: res.statusCode,
    //     headers: res.getHeaders?.() || res._headers || {},
    //   }),
    // },
    // autoLogging: {
    //   ignore: (req) => {
    //     // Ignore health check that are not logged
    //     return req.url.startsWith('/__health__') || req.url.startsWith('/health');
    //   },
    // },
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

// app.use((req, res, next) => {
//   const start = Date.now();
//   res.on('finish', () => {
//     const responseTime = Date.now() - start;
//     logger.info({
//       method: req.method,
//       url: req.originalUrl,
//       statusCode: res.statusCode,
//       responseTime,
//     }, 'HTTP request');
//   });
//   next();
// });

app.use(tracingMiddleware);

// Static Routes
app.use('/health', healthRouter);

// CORS
configureCORS(app);

// logger.info("Serving paths under '%s'", config.contextPath);
// app.use(`${config.contextPath}/api`, apiRouter);

app.use('/api/v1', v1Router);
// logger.debug('✅ Manual debug log works');
app.use(handleGeneralExceptions);

export default app;
