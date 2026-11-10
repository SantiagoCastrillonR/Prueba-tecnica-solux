import { Inject, Injectable } from '@nestjs/common';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions.js';
import {
  REVOKED_SESSION_REPOSITORY,
  type RevokedSessionRepository,
} from '../../domain/ports/revoked-session.repository.js';
import {
  SESSION_NOTIFIER,
  type SessionNotifier,
} from '../../domain/ports/session.notifier.js';
import {
  TOKEN_SERVICE,
  type TokenService,
  type VerifiedToken,
} from '../../domain/ports/token.service.js';

@Injectable()
export class SessionService {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(REVOKED_SESSION_REPOSITORY)
    private readonly revoked: RevokedSessionRepository,
    @Inject(SESSION_NOTIFIER) private readonly notifier: SessionNotifier,
  ) {}

  async verify(token: string): Promise<VerifiedToken> {
    const session = await this.tokens.verify(token);
    if (await this.revoked.isRevoked(session.sessionId)) {
      throw new InvalidTokenException('Session ended');
    }
    return session;
  }

  async end(token: string | undefined): Promise<void> {
    if (!token) return;
    let session: VerifiedToken;
    try {
      session = await this.tokens.verify(token);
    } catch {
      return;
    }
    await this.revoked.revoke(session.sessionId, session.expiresAt);
    this.notifier.sessionEnded(session.sessionId);
  }
}
