import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { REFRESH_STRATEGY, COOKIE_REFRESH } from '../constants';
import { JwtRefreshPayload } from '../types/jwt-payloads';
import type { Request } from 'express';

function cookieExtractor(cookieName: string) {
  return (req: Request | null): string | null => {
    const cookies = req?.cookies as
      | Record<string, string | undefined>
      | undefined;
    return cookies?.[cookieName] ?? null;
  };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  REFRESH_STRATEGY,
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor(
        config.get<string>('COOKIE_REFRESH_NAME') ?? COOKIE_REFRESH,
      ),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  validate(payload: JwtRefreshPayload) {
    // tutaj nie ładujemy usera — tylko payload refresh tokenu
    return payload;
  }
}
