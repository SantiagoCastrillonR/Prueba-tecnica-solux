import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { AuthenticatedSocket } from '@modules/auth/infrastructure/ws/socket-auth.adapter.js';
import { MessageResponse } from '../../application/dtos/message.response.js';
import { SendMessageDto } from '../../application/dtos/send-message.dto.js';
import { ListMyChatIdsUseCase } from '../../application/use-cases/list-my-chat-ids.use-case.js';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case.js';
import { CHAT_EVENTS, chatRoom, userRoom } from './chat-events.js';
import { errorAck, validatePayload, type ErrorAck } from './ws-ack.js';

export type MessageAck = { ok: true; message: MessageResponse } | ErrorAck;

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly listMyChatIds: ListMyChatIdsUseCase,
    private readonly sendMessage: SendMessageUseCase,
  ) {}

  async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    const { user } = socket.data;
    try {
      await socket.join(userRoom(user.id));
      const chatIds = await this.listMyChatIds.execute(user.id);
      await socket.join(chatIds.map(chatRoom));
    } catch (err) {
      this.logger.error(
        `Could not join rooms for ${user.id}: ${(err as Error).message}`,
      );
      socket.disconnect(true);
    }
  }

  @SubscribeMessage(CHAT_EVENTS.message)
  async onMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: unknown,
  ): Promise<MessageAck> {
    const input = await validatePayload(SendMessageDto, payload);
    if (!input.ok) return input;
    try {
      const { message, sender } = await this.sendMessage.execute(
        input.value,
        socket.data.user.id,
      );
      return { ok: true, message: MessageResponse.fromDomain(message, sender) };
    } catch (err) {
      return errorAck(err, this.logger);
    }
  }
}
