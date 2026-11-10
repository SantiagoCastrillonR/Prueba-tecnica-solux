import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  Message,
  type MessageWithSender,
} from '../../domain/entities/message.entity.js';
import { InvalidMessageDataException } from '../../domain/exceptions/chat.exceptions.js';
import {
  CHAT_NOTIFIER,
  type ChatNotifier,
} from '../../domain/ports/chat.notifier.js';
import {
  MESSAGE_REPOSITORY,
  type MessageRepository,
} from '../../domain/ports/message.repository.js';
import { SendMessageDto } from '../dtos/send-message.dto.js';
import { ChatAccessService } from '../services/chat-access.service.js';

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly access: ChatAccessService,
    @Inject(MESSAGE_REPOSITORY) private readonly messages: MessageRepository,
    @Inject(CHAT_NOTIFIER) private readonly notifier: ChatNotifier,
  ) {}

  async execute(
    dto: SendMessageDto,
    senderId: string,
  ): Promise<MessageWithSender> {
    const { chat, member } = await this.access.requireMember(
      dto.chatId,
      senderId,
    );
    const { message, created } = await this.messages.save(
      Message.create({
        id: randomUUID(),
        chatId: chat.id,
        senderId,
        clientId: dto.clientId,
        body: dto.body,
        createdAt: new Date(),
      }),
    );
    if (!created && message.chatId !== chat.id) {
      throw new InvalidMessageDataException('clientId was already used');
    }
    if (created) {
      this.notifier.messageCreated(message, member);
    }
    return { message, sender: member };
  }
}
