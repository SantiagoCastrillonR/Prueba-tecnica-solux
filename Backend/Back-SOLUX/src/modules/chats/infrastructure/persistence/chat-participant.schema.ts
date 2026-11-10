import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../../../users/infrastructure/persistence/user.schema.js';
import { chats } from './chat.schema.js';

export const chatParticipants = pgTable(
  'chat_participants',
  {
    chatId: uuid('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.chatId, t.userId] }),
    index('chat_participants_user_id_idx').on(t.userId),
  ],
);

export type ChatParticipantRow = typeof chatParticipants.$inferSelect;
export type NewChatParticipantRow = typeof chatParticipants.$inferInsert;
