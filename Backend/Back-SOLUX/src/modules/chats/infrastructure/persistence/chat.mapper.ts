import { Chat, type ChatMember } from '../../domain/entities/chat.entity.js';
import type { ChatRow, NewChatRow } from './chat.schema.js';

export const ChatMapper = {
  toDomain(row: ChatRow, members: ChatMember[]): Chat {
    return Chat.create({
      id: row.id,
      name: row.name,
      isGroup: row.isGroup,
      directKey: row.directKey,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      members,
    });
  },

  toPersistence(chat: Chat): NewChatRow {
    return {
      id: chat.id,
      name: chat.name,
      isGroup: chat.isGroup,
      directKey: chat.directKey,
      createdBy: chat.createdBy,
      createdAt: chat.createdAt,
    };
  },
};
