import { Injectable } from '@nestjs/common';
import type { Chat } from '../../domain/entities/chat.entity.js';
import { ChatAccessService } from '../services/chat-access.service.js';

@Injectable()
export class JoinChatUseCase {
  constructor(private readonly access: ChatAccessService) {}

  async execute(chatId: string, currentUserId: string): Promise<Chat> {
    const { chat } = await this.access.requireMember(chatId, currentUserId);
    return chat;
  }
}
