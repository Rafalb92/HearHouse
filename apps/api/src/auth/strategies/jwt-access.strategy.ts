import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_STRATEGY, COOKIE_ACCESS } from '../constants';
import { JwtAccessPayload } from '../types/jwt-payloads';
import { AuthService } from '../auth.service';
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
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  ACCESS_STRATEGY,
) {
  constructor(
    config: ConfigService,
    private readonly auth: AuthService,
  ) {
    super({
      jwtFromRequest: cookieExtractor(
        config.get<string>('COOKIE_ACCESS_NAME') ?? COOKIE_ACCESS,
      ),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JwtAccessPayload) {
    return this.auth.validateAccessPayload(payload);
  }
}
