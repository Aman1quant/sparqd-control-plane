import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '@utils/api';
import mainLogger from '@config/logger';

function handleGeneralExceptions(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  const logger = req.log || mainLogger;

  logger.error({ err, module: 'global-exception-handler' }, 'Uncaught exception occurred');
  res.status(500).json(createErrorResponse('An unknown exception has occurred: ', err.message));
}

export default handleGeneralExceptions;
