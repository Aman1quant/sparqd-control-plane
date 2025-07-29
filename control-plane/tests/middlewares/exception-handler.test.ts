import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import handleGeneralExceptions from '@middlewares/exception-handler';
import { mockReqLogger } from '../__mocks__/config/logger';
import { createErrorResponse } from '@utils/api';

describe('handleGeneralExceptions middleware', () => {
  it('should catch an exception and return a 500 with expected message', async () => {
    const app = express();
    app.use(mockReqLogger);

    // Simulated route that throws an error
    app.get('/error', (req: Request, res: Response, next: NextFunction) => {
      throw new Error('Test exception');
    });

    app.use(handleGeneralExceptions);

    const fakeResponse = { message: 'fake error response' };
    (createErrorResponse as jest.Mock).mockReturnValue(fakeResponse);

    const res = await request(app).get('/error');

    expect(res.status).toBe(500);
    expect(res.body).toEqual(fakeResponse);

    expect(createErrorResponse).toHaveBeenCalledWith('An unknown exception has occurred: ', 'Test exception');
  });

  it('should pass on err to next when response header already sent', async () => {
    let req: any = {
      log: {
        error: jest.fn(),
      },
    };

    let res: any = {
      headersSent: true,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    let next: jest.Mock = jest.fn();
    const error = new Error('Something went wrong');

    handleGeneralExceptions(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
