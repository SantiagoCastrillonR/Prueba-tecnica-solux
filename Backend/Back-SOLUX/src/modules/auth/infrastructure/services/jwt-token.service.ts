import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions.js';
import type {
  IssuedToken,
  TokenPayload,
  TokenService,
  VerifiedToken,
} from '../../domain/ports/token.service.js';

interface JwtClaims extends TokenPayload {
  jti?: string;
  exp?: number;
}

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly logger = new Logger(JwtTokenService.name);

  private readonly secret: string;

  private readonly ttlSeconds: number;

  constructor(
    config: ConfigService,
    private readonly jwt: JwtService,
  ) {
    this.secret = config.getOrThrow<string>('JWT_SECRET');
    this.ttlSeconds = parseDurationSeconds(
      config.get<string>('JWT_EXPIRES_IN', '1d'),
    );
  }

  async sign(payload: TokenPayload): Promise<IssuedToken> {
    const token = await this.jwt.signAsync(
      { sub: payload.sub, email: payload.email },
      {
        secret: this.secret,
        expiresIn: this.ttlSeconds,
        jwtid: randomUUID(),
      },
    );
    return { token, expiresIn: this.ttlSeconds };
  }

  async verify(token: string): Promise<VerifiedToken> {
    let claims: JwtClaims;
    try {
      claims = await this.jwt.verifyAsync<JwtClaims>(token, {
        secret: this.secret,
      });
    } catch (err) {
      this.logger.debug(`Token verify failed: ${(err as Error).message}`);
      throw new InvalidTokenException();
    }
    if (!claims.jti || !claims.exp) throw new InvalidTokenException();
    return {
      sub: claims.sub,
      email: claims.email,
      sessionId: claims.jti,
      expiresAt: new Date(claims.exp * 1000),
    };
  }
}

function parseDurationSeconds(value: string): number {
  const match = /^(\d+)([smhd])?$/.exec(value.trim());
  if (!match) throw new Error(`Invalid JWT duration: ${value}`);
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return Number(match[1]) * multipliers[match[2] ?? 's'];
}
