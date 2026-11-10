import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../../../users/infrastructure/persistence/user.schema.js';
import {
  CHAT_NAME_MAX_LENGTH,
  DIRECT_KEY_LENGTH,
} from '../../domain/chat.limits.js';

export const chats = pgTable(
  'chats',
  {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: CHAT_NAME_MAX_LENGTH }),
    isGroup: boolean('is_group').notNull().default(false),
    directKey: varchar('direct_key', { length: DIRECT_KEY_LENGTH }).unique(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      'chats_kind_check',
      sql`(${t.isGroup} and ${t.directKey} is null) or (not ${t.isGroup} and ${t.directKey} is not null and ${t.name} is null)`,
    ),
    check(
      'chats_name_not_blank_check',
      sql`${t.name} is null or char_length(btrim(${t.name})) > 0`,
    ),
  ],
);

export type ChatRow = typeof chats.$inferSelect;
export type NewChatRow = typeof chats.$inferInsert;
