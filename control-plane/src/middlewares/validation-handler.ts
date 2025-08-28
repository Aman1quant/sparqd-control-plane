// import { createErrorResponse } from '@utils/api';
// import { NextFunction, Request, RequestHandler, Response } from 'express';
// import { ResultFactory, validationResult } from 'express-validator';

// const validator: ResultFactory<string> = validationResult.withDefaults({
//   formatter: (error) => error.msg as string,
// });

// function _handleValidation(req: Request, res: Response, next: NextFunction, apiFn: RequestHandler) {
//   const validation = validator(req);
//   if (!validation.isEmpty()) {
//     const errors = validation.array().join(';');
//     return res.status(400).json(createErrorResponse('Request Validation Error', errors));
//   }

//   const result = apiFn(req, res, next);
//   if (result && typeof (result as Promise<void>).catch === 'function') {
//     (result as Promise<void>).catch(next);
//   }
// }

// function validateRequest(fn: RequestHandler): RequestHandler {
//   return (req: Request, res: Response, next: NextFunction) => {
//     _handleValidation(req, res, next, fn);
//   };
// }

// export default validateRequest;
