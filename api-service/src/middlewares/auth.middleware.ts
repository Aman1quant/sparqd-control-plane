import config from '@/config/config';
import { getUserByKcSub } from '@/services/user.service';
import { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet, JWTPayload } from 'jose';

// Keycloak settings
const JWKS = createRemoteJWKSet(new URL(`${config.keycloak.issuer}/protocol/openid-connect/certs`));
const ISSUER = config.keycloak.issuer;

declare global {
  namespace Express {
    interface Request {
      kcUser?: JWTPayload;
      user?: User;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or malformed token' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      // Optional: uncomment if you want to verify audience/client ID
      // audience: "control-plane-frontend",
    });

    // const user = getUserByKcSub(payload.sub);
    req.kcUser = payload;

    if (payload.sub) {
      const user = await getUserByKcSub(payload.sub);
      req.user = user ?? undefined;
    }
    next();
  } catch (err) {
    console.error('Token validation failed:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
}
