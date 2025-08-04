import config from '@/config/config';
import logger from '@/config/logger';
import { getUserByKcSub } from '@/domains/user/user.service';
import { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Keycloak settings
const JWKS = createRemoteJWKSet(new URL(`${config.keycloak.issuer}/protocol/openid-connect/certs`));
const ISSUER = config.keycloak.issuer;

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

    req.kcUser = payload;

    // Return 401 early if sub not found
    if (!payload.sub) {
      res.status(401).json({ message: 'Unauthorized. Missing subject in token' });
      return;
    }

    logger.debug(`payload.sub: ${payload.sub}`);

    // For /onboarding path: skip user check
    if (req.path.endsWith('onboarding')) {
      next();
    } else {
      const user = await getUserByKcSub(payload.sub);
      // Return 401 early if user not found
      if (!user) {
        res.status(401).json({ message: 'Unauthorized. User not found' });
        return;
      }

      req.user = user;
      next();
    }
  } catch (err) {
    console.error('Token validation failed:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
}

export {};
