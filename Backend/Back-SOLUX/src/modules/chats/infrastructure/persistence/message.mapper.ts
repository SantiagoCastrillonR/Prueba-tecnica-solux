import { Message } from '../../domain/entities/message.entity.js';
import type { MessageRow, NewMessageRow } from './message.schema.js';

export const MessageMapper = {
  toDomain(row: MessageRow): Message {
    return Message.create({
      id: row.id,
      chatId: row.chatId,
      senderId: row.senderId,
      clientId: row.clientId,
      body: row.body,
      createdAt: row.createdAt,
    });
  },

  toPersistence(message: Message): NewMessageRow {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      clientId: message.clientId,
      body: message.body,
      createdAt: message.createdAt,
    };
  },
};
