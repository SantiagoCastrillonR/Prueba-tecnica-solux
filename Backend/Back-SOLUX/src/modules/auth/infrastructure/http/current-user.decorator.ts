import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    if (!req.user) {
      throw new InvalidTokenException(
        'CurrentUser used on an unauthenticated route',
      );
    }
    return req.user;
  },
);
