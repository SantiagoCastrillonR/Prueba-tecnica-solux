import { Inject, Injectable } from '@nestjs/common';
import type { MessageWithSender } from '../../domain/entities/message.entity.js';
import { InvalidMessageDataException } from '../../domain/exceptions/chat.exceptions.js';
import {
  MESSAGE_REPOSITORY,
  type MessageRepository,
} from '../../domain/ports/message.repository.js';
import { ListMessagesQueryDto } from '../dtos/list-messages.query.js';
import { ChatAccessService } from '../services/chat-access.service.js';

@Injectable()
export class ListMessagesUseCase {
  constructor(
    private readonly access: ChatAccessService,
    @Inject(MESSAGE_REPOSITORY) private readonly messages: MessageRepository,
  ) {}

  async execute(
    chatId: string,
    query: ListMessagesQueryDto,
    currentUserId: string,
  ): Promise<MessageWithSender[]> {
    if (query.before && query.after) {
      throw new InvalidMessageDataException('use either before or after');
    }
    const { chat } = await this.access.requireMember(chatId, currentUserId);
    const page = await this.messages.findPage({
      chatId,
      before: query.before,
      after: query.after,
      limit: query.limit,
    });
    return page.map((message) => ({
      message,
      sender: chat.member(message.senderId)!,
    }));
  }
}
