import { Request, Response, NextFunction, RequestHandler } from 'express';
import logger from '@config/logger';
import { createErrorResponse } from '@utils/api';

export interface BearerAuthOptions {
  tokens: string[];
  ignorePaths?: string[];
}

/**
 * Creates an Express middleware for static bearer token auth
 * @param options - Configuration options including token list and custom error handlers
 * @returns Express RequestHandler
 */
export function createBearerAuthMiddleware(options: BearerAuthOptions): RequestHandler {
  logger.info('Setting up bearer token auth');

  if (options.tokens && options.tokens.length === 0) {
    logger.warn('No tokens provided, disabling bearer token auth');
    return (_req: Request, _res: Response, next: NextFunction): void => next();
  }

  const tokenSet = new Set<string>(options.tokens.map((t) => t.trim()).filter(Boolean));
  logger.info('%d tokens loaded', tokenSet.size);

  return function bearerAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    req.log?.debug('Checking bearer token');
    const authHeader = req.headers['authorization'];

    if (options.ignorePaths && options.ignorePaths.includes(req.path)) {
      req.log?.debug('Ignoring path %s', req.path);
      return next();
    }

    if (!authHeader?.startsWith('Bearer ')) {
      req.log?.warn('No auth header found.');

      res.status(401).json(createErrorResponse('Missing or malformed Authorization header'));
    }

    const token = authHeader?.substring(7).trim(); // remove "Bearer "

    if (!token || !tokenSet.has(token)) {
      res.status(403).json(createErrorResponse('Invalid bearer token'));
      return;
    }

    next();
  };
}
