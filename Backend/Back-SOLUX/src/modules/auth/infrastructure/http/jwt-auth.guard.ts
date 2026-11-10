import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { SessionService } from '../../application/services/session.service.js';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions.js';
import { AUTH_COOKIE } from './auth-cookie.js';
import type { AuthenticatedUser } from './current-user.decorator.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const token = (req.cookies as Record<string, string> | undefined)?.[
      AUTH_COOKIE
    ];
    if (!token) {
      throw new InvalidTokenException('Missing session cookie');
    }
    const session = await this.sessions.verify(token);
    req.user = { id: session.sub, email: session.email };
    return true;
  }
}
