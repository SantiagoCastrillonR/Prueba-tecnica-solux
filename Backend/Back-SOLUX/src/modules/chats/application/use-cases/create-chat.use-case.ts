import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserNotFoundException } from '@modules/users/domain/exceptions/user.exceptions.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@modules/users/domain/ports/user.repository.js';
import { Chat, type ChatMember } from '../../domain/entities/chat.entity.js';
import { DirectChatAlreadyExistsException } from '../../domain/exceptions/chat.exceptions.js';
import {
  CHAT_NOTIFIER,
  type ChatNotifier,
} from '../../domain/ports/chat.notifier.js';
import {
  CHAT_REPOSITORY,
  type ChatRepository,
} from '../../domain/ports/chat.repository.js';
import { CreateChatDto } from '../dtos/create-chat.dto.js';

export interface CreateChatResult {
  chat: Chat;
  created: boolean;
}

@Injectable()
export class CreateChatUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chats: ChatRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(CHAT_NOTIFIER) private readonly notifier: ChatNotifier,
  ) {}

  async execute(
    dto: CreateChatDto,
    currentUserId: string,
  ): Promise<CreateChatResult> {
    const { creator, others } = await this.resolveMembers(
      currentUserId,
      dto.participantIds,
    );
    const chat = Chat.start({
      id: randomUUID(),
      creator,
      others,
      name: dto.name,
      createdAt: new Date(),
    });

    if (chat.directKey) {
      const existing = await this.chats.findDirect(chat.directKey);
      if (existing) return { chat: existing, created: false };
    }

    try {
      const saved = await this.chats.create(chat);
      this.notifier.chatCreated(saved);
      return { chat: saved, created: true };
    } catch (err) {
      if (err instanceof DirectChatAlreadyExistsException && chat.directKey) {
        const existing = await this.chats.findDirect(chat.directKey);
        if (existing) return { chat: existing, created: false };
      }
      throw err;
    }
  }

  private async resolveMembers(
    currentUserId: string,
    participantIds: string[],
  ): Promise<{ creator: ChatMember; others: ChatMember[] }> {
    const ids = [...new Set([currentUserId, ...participantIds])];
    const found = new Map(
      (await this.users.findByIds(ids)).map((u) => [u.id, u]),
    );
    const missing = ids.find((id) => !found.has(id));
    if (missing) throw new UserNotFoundException(missing);

    const toMember = (id: string): ChatMember => ({
      userId: id,
      name: found.get(id)!.name,
    });
    return {
      creator: toMember(currentUserId),
      others: ids.filter((id) => id !== currentUserId).map(toMember),
    };
  }
}
