// src/common/csrf/csrf.config.ts
import { doubleCsrf } from 'csrf-csrf';
import type { Request } from 'express';

export const { generateCsrfToken, validateRequest, doubleCsrfProtection } =
  doubleCsrf({
    getSecret: () =>
      process.env.CSRF_SECRET || 'your-super-secret-change-in-production',

    // ===== TO BRAKOWAŁO =====
    getSessionIdentifier: (req: Request) => {
      const cookies = req.cookies as Record<string, string | undefined>;
      const refreshToken = cookies?.refresh_token;
      if (refreshToken) return refreshToken;
      return `${req.ip}-${req.headers['user-agent'] ?? 'unknown'}`;
    },
    // ========================

    cookieName: 'x-csrf-token',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
  });
