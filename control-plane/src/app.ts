import config from '@config/config';
import { RegisterRoutes } from "../dist/routes";
import { default as configureCORS } from '@helpers/bootstrap/cors';
import handleGeneralExceptions from '@middlewares/exception-handler';
import healthRouter from '@routes/health-check';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';

import httpLogger from '@/config/httpLogger';
import path from 'path';
import { errorHandler } from './middlewares/error-handler';

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

// Health check
app.use('/health', healthRouter);

// CORS
configureCORS(app);

// V1 routes
const tsoaApiV1Router = express.Router();
RegisterRoutes(tsoaApiV1Router);
app.use("/api/v1", tsoaApiV1Router);

/**
 * Serve OpenAPI file from the docs directory
 */
app.use('/api-specs', express.static(path.join(__dirname, "..", "dist")))
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

// General Exception handler
// app.use(handleGeneralExceptions);

// Error handler
app.use(errorHandler);

export default app;
