import { HttpError } from '@/types/errors';
import { NextFunction, Request, Response } from 'express';

// This is the global error handler
export function errorHandler(err: HttpError, req: Request, res: Response, _next: NextFunction) {
  // `req.log` comes from pino-http, already has traceId bound
  req.log.error({ err }, 'Request failed');

  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    traceId: req.id, // send traceId back if you want clients to report it
  });
}
