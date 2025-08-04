import { JWTPayload } from 'jose';
import { UserSessionInfo } from '@/domains/user/user.service';

export {}; // <-- mark as a module

declare global {
  namespace Express {
    interface Request {
      kcUser?: JWTPayload;
      user: UserSessionInfo;
    }
  }
}
