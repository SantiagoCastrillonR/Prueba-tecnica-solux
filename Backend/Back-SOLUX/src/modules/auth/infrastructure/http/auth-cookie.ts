import type { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

export const AUTH_COOKIE = 'access_token';

export function isCookieSecure(config: ConfigService): boolean {
  const raw = config.get<string | boolean>('COOKIE_SECURE');
  if (raw === undefined || raw === '') {
    return config.get<string>('NODE_ENV') === 'production';
  }
  return raw === true || raw === 'true';
}

export function authCookieOptions(secure: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
  };
}
