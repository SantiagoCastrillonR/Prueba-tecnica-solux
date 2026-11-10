import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, inArray, type SQL } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@shared/database/database.tokens.js';
import type { Database } from '@shared/database/database.module.js';
import { pgError, PG_UNIQUE_VIOLATION } from '@shared/database/pg-errors.js';
import { users } from '@modules/users/infrastructure/persistence/user.schema.js';
import type { Chat, ChatMember } from '../../domain/entities/chat.entity.js';
import { DirectChatAlreadyExistsException } from '../../domain/exceptions/chat.exceptions.js';
import type {
  ChatRepository,
  ChatSummary,
} from '../../domain/ports/chat.repository.js';
import { chatParticipants } from './chat-participant.schema.js';
import { ChatMapper } from './chat.mapper.js';
import { chats } from './chat.schema.js';
import { MessageMapper } from './message.mapper.js';
import { messages } from './message.schema.js';

@Injectable()
export class DrizzleChatRepository implements ChatRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  findById(id: string): Promise<Chat | null> {
    return this.findOneWhere(eq(chats.id, id));
  }

  findDirect(directKey: string): Promise<Chat | null> {
    return this.findOneWhere(eq(chats.directKey, directKey));
  }

  async create(chat: Chat): Promise<Chat> {
    try {
      await this.db.transaction(async (tx) => {
        await tx.insert(chats).values(ChatMapper.toPersistence(chat));
        await tx.insert(chatParticipants).values(
          chat.members.map((m) => ({
            chatId: chat.id,
            userId: m.userId,
            joinedAt: chat.createdAt,
          })),
        );
      });
      return chat;
    } catch (err) {
      const pg = pgError(err);
      if (
        chat.directKey &&
        pg?.code === PG_UNIQUE_VIOLATION &&
        pg.constraint === 'chats_direct_key_unique'
      ) {
        throw new DirectChatAlreadyExistsException(chat.directKey);
      }
      throw err;
    }
  }

  async findSummariesForUser(userId: string): Promise<ChatSummary[]> {
    const rows = await this.db
      .select({ chat: chats })
      .from(chats)
      .innerJoin(chatParticipants, eq(chatParticipants.chatId, chats.id))
      .where(eq(chatParticipants.userId, userId));
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.chat.id);
    const [members, lastMessages] = await Promise.all([
      this.loadMembers(ids),
      this.db
        .selectDistinctOn([messages.chatId])
        .from(messages)
        .where(inArray(messages.chatId, ids))
        .orderBy(messages.chatId, desc(messages.createdAt), desc(messages.id)),
    ]);
    const lastByChat = new Map(
      lastMessages.map((m) => [m.chatId, MessageMapper.toDomain(m)]),
    );

    const activity = (s: ChatSummary): number =>
      (s.lastMessage?.createdAt ?? s.chat.createdAt).getTime();
    return rows
      .map(({ chat }) => ({
        chat: ChatMapper.toDomain(chat, members.get(chat.id) ?? []),
        lastMessage: lastByChat.get(chat.id) ?? null,
      }))
      .sort(
        (a, b) =>
          activity(b) - activity(a) || a.chat.id.localeCompare(b.chat.id),
      );
  }

  async findIdsForUser(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, userId));
    return rows.map((r) => r.chatId);
  }

  private async findOneWhere(condition: SQL): Promise<Chat | null> {
    const [row] = await this.db.select().from(chats).where(condition).limit(1);
    if (!row) return null;
    const members = await this.loadMembers([row.id]);
    return ChatMapper.toDomain(row, members.get(row.id) ?? []);
  }

  private async loadMembers(
    chatIds: string[],
  ): Promise<Map<string, ChatMember[]>> {
    const rows = await this.db
      .select({
        chatId: chatParticipants.chatId,
        userId: users.id,
        name: users.name,
      })
      .from(chatParticipants)
      .innerJoin(users, eq(users.id, chatParticipants.userId))
      .where(inArray(chatParticipants.chatId, chatIds))
      .orderBy(asc(chatParticipants.joinedAt), asc(users.name));

    const byChat = new Map<string, ChatMember[]>();
    for (const { chatId, userId, name } of rows) {
      const list = byChat.get(chatId) ?? [];
      list.push({ userId, name });
      byChat.set(chatId, list);
    }
    return byChat;
  }
}
