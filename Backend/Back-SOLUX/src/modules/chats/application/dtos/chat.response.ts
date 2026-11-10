import { ApiProperty } from '@nestjs/swagger';
import type { Chat } from '../../domain/entities/chat.entity.js';
import type { Message } from '../../domain/entities/message.entity.js';
import { MemberResponse, MessageResponse } from './message.response.js';

export class ChatResponse {
  @ApiProperty() id!: string;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'null for direct chats',
  })
  name!: string | null;

  @ApiProperty() isGroup!: boolean;

  @ApiProperty({ type: [MemberResponse] }) members!: MemberResponse[];

  @ApiProperty({ type: MessageResponse, nullable: true })
  lastMessage!: MessageResponse | null;

  @ApiProperty() createdAt!: Date;

  static fromDomain(
    chat: Chat,
    lastMessage: Message | null = null,
  ): ChatResponse {
    const sender = lastMessage ? chat.member(lastMessage.senderId) : undefined;
    return {
      id: chat.id,
      name: chat.name,
      isGroup: chat.isGroup,
      members: chat.members.map(MemberResponse.fromDomain),
      lastMessage:
        lastMessage && sender
          ? MessageResponse.fromDomain(lastMessage, sender)
          : null,
      createdAt: chat.createdAt,
    };
  }
}
