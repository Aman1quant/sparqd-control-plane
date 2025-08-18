import { NextFunction, Request, Response } from 'express';

// This is the global error handler
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // `req.log` comes from pino-http, already has traceId bound
  req.log.error({ err }, 'Request failed');

  res.status(500).json({
    error: 'Internal Server Error',
    traceId: req.id, // send traceId back if you want clients to report it
  });
}
