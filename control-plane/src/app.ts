import config from '@config/config';
import { RegisterRoutes } from "../dist/routes";
import { default as configureCORS } from '@helpers/bootstrap/cors';
import handleGeneralExceptions from '@middlewares/exception-handler';
import healthRouter from '@routes/health-check';
// import { tracingMiddleware } from '@middlewares/tracing-handler';
// import { generateRequestId } from '@utils/api';
// import v1Router from '@routes/v1';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';

import httpLogger from '@/config/httpLogger';
import path from 'path';

const app = express();

app.use(compression());
app.use(express.json({ limit: config.jsonLimit }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());

// Configure session
const memoryStore = new session.MemoryStore();
app.use(
  session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    },
  }),
);

// HTTP Logger
app.use(httpLogger);

// Middlewares
// const logHttpTraffic = config.logLevel === 'debug';
// app.use(
//   pinoHttp({
//     logger,
//     genReqId: generateRequestId,
//     // quietReqLogger: !logHttpTraffic,
//     // quietResLogger: !logHttpTraffic,
//     // serializers: {
//     //   req: (req) => ({
//     //     method: req.method,
//     //     url: req.url,
//     //     headers: {
//     //       ...req.headers,
//     //       authorization: undefined,
//     //       cookie: undefined,
//     //     },
//     //     remoteAddress: req.socket?.remoteAddress,
//     //     remotePort: req.socket?.remotePort,
//     //   }),
//     //   res: (res) => ({
//     //     statusCode: res.statusCode,
//     //     headers: res.getHeaders?.() || res._headers || {},
//     //   }),
//     // },
//     // autoLogging: {
//     //   ignore: (req) => {
//     //     // Ignore health check that are not logged
//     //     return req.url.startsWith('/__health__') || req.url.startsWith('/health');
//     //   },
//     // },
//     customLogLevel: (_req, res, _err) => {
//       if (res.statusCode >= 500) {
//         return 'error';
//       }

//       if (res.statusCode >= 400) {
//         return 'warn';
//       }

//       return 'info';
//     },
//   }),
// );

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

// app.use(tracingMiddleware);

// Test
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     console.log(`DEBUG: ${req.method} ${req.url} => ${res.statusCode}`);
//   });
//   next();
// });

// Health check
app.use('/health', healthRouter);

// CORS
configureCORS(app);

// V1 routes
// app.use('/api/v1', v1Router);
const tsoaApiV1Router = express.Router();
RegisterRoutes(tsoaApiV1Router);
app.use("/api/v1", tsoaApiV1Router);

// General Exception handler
app.use(handleGeneralExceptions);

/**
 * Serve OpenAPI file from the docs directory
 */
app.use('/api-specs', express.static(path.join(__dirname, 'docs')))
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/docs")) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'self' 'unsafe-inline';"
    );
  }
  next();
});
// Serve the local Stoplight Elements static assets
app.use('/docs/assets', express.static(path.join(__dirname, 'docs', 'assets')))
// Serve the documentation HTML page
app.get('/docs', (_req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https://unpkg.com; " +
    "script-src 'self' https://unpkg.com; " +
    "style-src 'self' 'unsafe-inline' https://unpkg.com; " +
    "font-src 'self' https://unpkg.com; " +
    "img-src 'self' data: https://unpkg.com; " +
    "connect-src 'self' https://unpkg.com https://raw.githubusercontent.com"
  );
  res.sendFile(path.join(__dirname, 'docs', 'elements.html'));
});

export default app;
