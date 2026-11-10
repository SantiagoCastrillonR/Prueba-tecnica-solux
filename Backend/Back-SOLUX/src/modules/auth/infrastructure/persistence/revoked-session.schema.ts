import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export const revokedSessions = pgTable(
  'revoked_sessions',
  {
    sessionId: uuid('session_id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('revoked_sessions_expires_at_idx').on(t.expiresAt)],
);

export type RevokedSessionRow = typeof revokedSessions.$inferSelect;
export type NewRevokedSessionRow = typeof revokedSessions.$inferInsert;
