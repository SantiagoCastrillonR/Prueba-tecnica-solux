import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@shared/database/database.tokens.js';
import type { Database } from '@shared/database/database.module.js';
import {
  pgError,
  PG_FOREIGN_KEY_VIOLATION,
  PG_UNIQUE_VIOLATION,
} from '@shared/database/pg-errors.js';
import type { Message } from '../../domain/entities/message.entity.js';
import { ChatAccessForbiddenException } from '../../domain/exceptions/chat.exceptions.js';
import type {
  MessagePageQuery,
  MessageRepository,
  SaveMessageResult,
} from '../../domain/ports/message.repository.js';
import { MessageMapper } from './message.mapper.js';
import { messages } from './message.schema.js';

@Injectable()
export class DrizzleMessageRepository implements MessageRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async save(message: Message): Promise<SaveMessageResult> {
    try {
      const [row] = await this.db
        .insert(messages)
        .values(MessageMapper.toPersistence(message))
        .returning();
      return { message: MessageMapper.toDomain(row), created: true };
    } catch (err) {
      const pg = pgError(err);
      if (
        pg?.code === PG_UNIQUE_VIOLATION &&
        pg.constraint === 'messages_sender_client_id_unique'
      ) {
        const existing = await this.findBySenderAndClientId(
          message.senderId,
          message.clientId,
        );
        if (existing) return { message: existing, created: false };
      }
      if (pg?.code === PG_FOREIGN_KEY_VIOLATION) {
        throw new ChatAccessForbiddenException();
      }
      throw err;
    }
  }

  async findPage({
    chatId,
    before,
    after,
    limit,
  }: MessagePageQuery): Promise<Message[]> {
    const cursor = (id: string) =>
      sql`(select m.created_at, m.id from ${messages} m where m.id = ${id} and m.chat_id = ${chatId})`;

    if (after) {
      const rows = await this.db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.chatId, chatId),
            sql`(${messages.createdAt}, ${messages.id}) > ${cursor(after)}`,
          ),
        )
        .orderBy(asc(messages.createdAt), asc(messages.id))
        .limit(limit);
      return rows.map(MessageMapper.toDomain);
    }

    const rows = await this.db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.chatId, chatId),
          before
            ? sql`(${messages.createdAt}, ${messages.id}) < ${cursor(before)}`
            : undefined,
        ),
      )
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(limit);
    return rows.reverse().map(MessageMapper.toDomain);
  }

  private async findBySenderAndClientId(
    senderId: string,
    clientId: string,
  ): Promise<Message | null> {
    const [row] = await this.db
      .select()
      .from(messages)
      .where(
        and(eq(messages.senderId, senderId), eq(messages.clientId, clientId)),
      )
      .limit(1);
    return row ? MessageMapper.toDomain(row) : null;
  }
}
