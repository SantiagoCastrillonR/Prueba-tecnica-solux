import { Inject, Injectable } from '@nestjs/common';
import type { Chat, ChatMember } from '../../domain/entities/chat.entity.js';
import {
  ChatAccessForbiddenException,
  ChatNotFoundException,
} from '../../domain/exceptions/chat.exceptions.js';
import {
  CHAT_REPOSITORY,
  type ChatRepository,
} from '../../domain/ports/chat.repository.js';

export interface ChatAccess {
  chat: Chat;
  member: ChatMember;
}

@Injectable()
export class ChatAccessService {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chats: ChatRepository,
  ) {}

  async requireMember(chatId: string, userId: string): Promise<ChatAccess> {
    const chat = await this.chats.findById(chatId);
    if (!chat) throw new ChatNotFoundException(chatId);
    const member = chat.member(userId);
    if (!member) throw new ChatAccessForbiddenException();
    return { chat, member };
  }
}
