import type { Chat } from '../entities/chat.entity.js';
import type { Message } from '../entities/message.entity.js';

export const CHAT_REPOSITORY = Symbol('CHAT_REPOSITORY');

export interface ChatSummary {
  chat: Chat;
  lastMessage: Message | null;
}

export interface ChatRepository {
  findById(id: string): Promise<Chat | null>;
  findDirect(directKey: string): Promise<Chat | null>;
  create(chat: Chat): Promise<Chat>;
  findSummariesForUser(userId: string): Promise<ChatSummary[]>;
  findIdsForUser(userId: string): Promise<string[]>;
}
