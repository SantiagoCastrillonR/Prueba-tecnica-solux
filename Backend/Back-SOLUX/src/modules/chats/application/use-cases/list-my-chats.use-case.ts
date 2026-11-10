import { Inject, Injectable } from '@nestjs/common';
import {
  CHAT_REPOSITORY,
  type ChatRepository,
  type ChatSummary,
} from '../../domain/ports/chat.repository.js';

@Injectable()
export class ListMyChatsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chats: ChatRepository,
  ) {}

  execute(currentUserId: string): Promise<ChatSummary[]> {
    return this.chats.findSummariesForUser(currentUserId);
  }
}
