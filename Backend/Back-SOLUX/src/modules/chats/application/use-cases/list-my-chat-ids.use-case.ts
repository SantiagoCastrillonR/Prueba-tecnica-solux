import { Inject, Injectable } from '@nestjs/common';
import {
  CHAT_REPOSITORY,
  type ChatRepository,
} from '../../domain/ports/chat.repository.js';

@Injectable()
export class ListMyChatIdsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chats: ChatRepository,
  ) {}

  execute(currentUserId: string): Promise<string[]> {
    return this.chats.findIdsForUser(currentUserId);
  }
}
