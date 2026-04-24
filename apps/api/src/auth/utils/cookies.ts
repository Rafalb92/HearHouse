import { ConfigService } from '@nestjs/config';
import { daysToMs, minutesToMs } from './time';

export function cookieBaseOptions(config: ConfigService) {
  const secure = config.get<string>('COOKIE_SECURE') === 'true';

  const sameSiteRaw = (
    config.get<string>('COOKIE_SAME_SITE') ?? 'lax'
  ).toLowerCase();
  const sameSite =
    sameSiteRaw === 'strict'
      ? 'strict'
      : sameSiteRaw === 'none'
        ? 'none'
        : 'lax';

  const domain = config.get<string>('COOKIE_DOMAIN') || undefined;
  const path = config.get<string>('COOKIE_PATH') || '/';

  return { httpOnly: true, secure, sameSite, domain, path } as const;
}

export function cookieMaxAgeAccess(config: ConfigService) {
  const ttlMin = Number(config.get<string>('ACCESS_TOKEN_TTL_MIN') ?? '15');
  return minutesToMs(ttlMin);
}

export function cookieMaxAgeRefresh(config: ConfigService) {
  const ttlDays = Number(config.get<string>('REFRESH_TOKEN_TTL_DAYS') ?? '14');
  return daysToMs(ttlDays);
}
