import type { AuthUser } from '../auth/types/auth-user.type';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export {};
