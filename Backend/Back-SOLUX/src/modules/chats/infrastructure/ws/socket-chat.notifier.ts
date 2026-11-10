import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import type { Chat, ChatMember } from '../../domain/entities/chat.entity.js';
import type { Message } from '../../domain/entities/message.entity.js';
import type { ChatNotifier } from '../../domain/ports/chat.notifier.js';
import { ChatResponse } from '../../application/dtos/chat.response.js';
import { MessageResponse } from '../../application/dtos/message.response.js';
import { CHAT_EVENTS, chatRoom, userRoom } from './chat-events.js';

@WebSocketGateway()
export class SocketChatNotifier implements ChatNotifier {
  @WebSocketServer()
  private readonly server?: Server;

  chatCreated(chat: Chat): void {
    if (!this.server) return;
    const memberRooms = chat.members.map((m) => userRoom(m.userId));
    this.server.in(memberRooms).socketsJoin(chatRoom(chat.id));
    this.server
      .to(memberRooms)
      .emit(CHAT_EVENTS.created, { chat: ChatResponse.fromDomain(chat) });
  }

  messageCreated(message: Message, sender: ChatMember): void {
    if (!this.server) return;
    this.server
      .to(chatRoom(message.chatId))
      .emit(CHAT_EVENTS.message, MessageResponse.fromDomain(message, sender));
  }
}
