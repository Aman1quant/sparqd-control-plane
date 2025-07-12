import express, { Request, Response } from 'express';
import request from 'supertest';
import { mockReqLogger } from '../__mocks__/config/logger';
import { createBearerAuthMiddleware } from '@middlewares/token-auth';

describe('Static Bearer Token Middleware', () => {
  const validTokens = ['token1', 'token2'];
  const middleware = createBearerAuthMiddleware({ tokens: validTokens, ignorePaths: ['/health'] });

  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(mockReqLogger);
    app.use(middleware);
    app.get('/secure', (_req: Request, res: Response) => {
      res.status(200).send('OK');
    });

    app.get('/health', (_req: Request, res: Response) => {
      res.status(200).send('OK');
    });
  });

  it('should allow request with valid bearer token', async () => {
    const res = await request(app)
      .get('/secure')
      .set('Authorization', 'Bearer token1');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should allow request that has been ignored', async () => {
    const res = await request(app)
      .get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should reject request with missing Authorization header', async () => {
    const res = await request(app).get('/secure');

    expect(res.statusCode).toBe(401);
  });

  it('should reject request with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/secure')
      .set('Authorization', 'Token token1'); // wrong scheme

    expect(res.statusCode).toBe(401);
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/secure')
      .set('Authorization', 'Bearer wrongtoken');

    expect(res.statusCode).toBe(403);
  });
});

describe('Static Bearer Token Middleware without logger', () => {
  const validTokens = ['token1', 'token2'];
  const middleware = createBearerAuthMiddleware({ tokens: validTokens, ignorePaths: ['/health'] });

  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(middleware);
    app.get('/secure', (_req: Request, res: Response) => {
      res.status(200).send('OK');
    });

    app.get('/health', (_req: Request, res: Response) => {
      res.status(200).send('OK');
    });
  });

  it('should allow request that has been ignored', async () => {
    const res = await request(app)
      .get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should reject request with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/secure')
      .set('Authorization', 'Token token1'); // wrong scheme

    expect(res.statusCode).toBe(401);
  });
});

describe('Disabled Token Middleware', () => {
  const validTokens: string[] = [];
  const middleware = createBearerAuthMiddleware({ tokens: validTokens });

  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(mockReqLogger);
    app.use(middleware);
    app.get('/secure', (_req: Request, res: Response) => {
      res.status(200).send('OK');
    });
  });

  it('should allow request with valid bearer token', async () => {
    const res = await request(app)
      .get('/secure')
      .set('Authorization', 'Bearer token1');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should allow request with missing Authorization header', async () => {
    const res = await request(app).get('/secure');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should accept request with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/secure')
      .set('Authorization', 'Token token1'); // wrong scheme
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should accept request with invalid token', async () => {
    const res = await request(app)
      .get('/secure')
      .set('Authorization', 'Bearer wrongtoken');
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });
});
