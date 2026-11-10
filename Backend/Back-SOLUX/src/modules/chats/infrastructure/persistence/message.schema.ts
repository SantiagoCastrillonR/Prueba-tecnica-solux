import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  MESSAGE_BODY_MAX_LENGTH,
  MESSAGE_CLIENT_ID_MAX_LENGTH,
} from '../../domain/chat.limits.js';
import { chatParticipants } from './chat-participant.schema.js';
import { chats } from './chat.schema.js';

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey(),
    chatId: uuid('chat_id').notNull(),
    senderId: uuid('sender_id').notNull(),
    clientId: varchar('client_id', {
      length: MESSAGE_CLIENT_ID_MAX_LENGTH,
    }).notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: 'messages_chat_id_fk',
      columns: [t.chatId],
      foreignColumns: [chats.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'messages_sender_participant_fk',
      columns: [t.chatId, t.senderId],
      foreignColumns: [chatParticipants.chatId, chatParticipants.userId],
    }),
    unique('messages_sender_client_id_unique').on(t.senderId, t.clientId),
    index('messages_chat_created_idx').on(
      t.chatId,
      t.createdAt.desc(),
      t.id.desc(),
    ),
    check(
      'messages_body_length_check',
      sql`char_length(${t.body}) between 1 and ${sql.raw(String(MESSAGE_BODY_MAX_LENGTH))}`,
    ),
  ],
);

export type MessageRow = typeof messages.$inferSelect;
export type NewMessageRow = typeof messages.$inferInsert;
