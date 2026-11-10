import { Inject, Injectable } from '@nestjs/common';
import { eq, lt } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@shared/database/database.tokens.js';
import type { Database } from '@shared/database/database.module.js';
import type { RevokedSessionRepository } from '../../domain/ports/revoked-session.repository.js';
import { revokedSessions } from './revoked-session.schema.js';

@Injectable()
export class DrizzleRevokedSessionRepository implements RevokedSessionRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async revoke(sessionId: string, expiresAt: Date): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(revokedSessions)
        .where(lt(revokedSessions.expiresAt, new Date()));
      await tx
        .insert(revokedSessions)
        .values({ sessionId, expiresAt })
        .onConflictDoNothing();
    });
  }

  async isRevoked(sessionId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ sessionId: revokedSessions.sessionId })
      .from(revokedSessions)
      .where(eq(revokedSessions.sessionId, sessionId))
      .limit(1);
    return row !== undefined;
  }
}
