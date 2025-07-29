import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createErrorResponse } from '@/utils/api';

export function resultValidator(req: Request, res: Response, next: NextFunction) {
  const validated = validationResult(req);

  if (!validated.isEmpty()) return next(res.status(422).json(createErrorResponse('Validation failed', validated.array())));

  return next();
}
