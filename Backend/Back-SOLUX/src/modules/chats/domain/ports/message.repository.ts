import type { Message } from '../entities/message.entity.js';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface MessagePageQuery {
  chatId: string;
  before?: string;
  after?: string;
  limit: number;
}

export interface SaveMessageResult {
  message: Message;
  created: boolean;
}

export interface MessageRepository {
  save(message: Message): Promise<SaveMessageResult>;
  findPage(query: MessagePageQuery): Promise<Message[]>;
}
