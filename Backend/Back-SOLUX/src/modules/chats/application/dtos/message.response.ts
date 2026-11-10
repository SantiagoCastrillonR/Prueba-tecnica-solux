import { ApiProperty } from '@nestjs/swagger';
import type { ChatMember } from '../../domain/entities/chat.entity.js';
import type { Message } from '../../domain/entities/message.entity.js';

export class MemberResponse {
  @ApiProperty() id!: string;

  @ApiProperty() name!: string;

  static fromDomain(member: ChatMember): MemberResponse {
    return { id: member.userId, name: member.name };
  }
}

export class MessageResponse {
  @ApiProperty() id!: string;

  @ApiProperty() chatId!: string;

  @ApiProperty({ type: MemberResponse }) sender!: MemberResponse;

  @ApiProperty() body!: string;

  @ApiProperty({
    description: 'Echo of the client id, to reconcile optimistic messages',
  })
  clientId!: string;

  @ApiProperty({ description: 'Server time (ISO 8601)' }) createdAt!: Date;

  static fromDomain(message: Message, sender: ChatMember): MessageResponse {
    return {
      id: message.id,
      chatId: message.chatId,
      sender: MemberResponse.fromDomain(sender),
      body: message.body,
      clientId: message.clientId,
      createdAt: message.createdAt,
    };
  }
}
