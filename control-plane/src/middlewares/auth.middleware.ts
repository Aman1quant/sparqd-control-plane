import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import config from '@/config/config';
import logger from '@/config/logger';
import { getInternalUserByKcSub } from '@/domains/user/user.service';

// Keycloak settings
const JWKS = createRemoteJWKSet(new URL(`${config.keycloak.issuer}/protocol/openid-connect/certs`));
const ISSUER = config.keycloak.issuer;

/**
 * Express middleware to authenticate requests using a Bearer JWT.
 *
 * - Verifies the token using JOSE and a JWKS key set.
 * - Attaches the raw JWT payload to `req.kcUser`.
 * - If `payload.sub` is present, looks up the user and sets `req.user`.
 * - For `/onboarding` paths, skips user lookup but still verifies token.
 * - Returns HTTP 401 for invalid, missing, or unverified tokens.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction to pass control
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present and properly formatted
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or malformed token' });
      return;
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    // Verify and decode the JWT using JOSE
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      // Optional: uncomment if you want to verify audience/client ID
      // audience: "control-plane-frontend",
    });

    // Attach the JWT payload to the request (for downstream use)
    req.kcUser = payload;

    // If no `sub` field is found in the payload, reject the request
    if (!payload.sub) {
      res.status(401).json({ message: 'Unauthorized. Missing subject in token' });
      return;
    }

    logger.debug(`payload.sub: ${payload.sub}`);

    // Allow token-only auth for onboarding route (skip user check)
    if (req.path.endsWith('onboarding')) {
      next();
    } else {
      // Lookup user from database using the sub field
      const user = await getInternalUserByKcSub(payload.sub);

      // If no user found, reject the request
      if (!user) {
        res.status(401).json({ message: 'Unauthorized. User not found' });
        return;
      }

      // Attach the found user to the request
      req.user = user;

      // Proceed to next middleware
      next();
    }
  } catch (err) {
    // Catch and report any errors in token verification
    // console.error('Token validation failed:', err);
    req.log.error({ err }, 'Something bad happened');
    res.status(401).json({ message: 'Invalid token' });
  }
}

export {};
