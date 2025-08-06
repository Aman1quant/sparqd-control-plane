import { JWTPayload } from 'jose';
import { UserInternalSessionInfo } from '@/domains/user/user.select';

export {}; // <-- mark as a module

declare global {
  namespace Express {
    interface Request {
      kcUser?: JWTPayload;
      user: UserInternalSessionInfo;
    }
  }
}
