import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module.js';
import { ChatAccessService } from './application/services/chat-access.service.js';
import { CreateChatUseCase } from './application/use-cases/create-chat.use-case.js';
import { ListMessagesUseCase } from './application/use-cases/list-messages.use-case.js';
import { ListMyChatIdsUseCase } from './application/use-cases/list-my-chat-ids.use-case.js';
import { ListMyChatsUseCase } from './application/use-cases/list-my-chats.use-case.js';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case.js';
import { CHAT_NOTIFIER } from './domain/ports/chat.notifier.js';
import { CHAT_REPOSITORY } from './domain/ports/chat.repository.js';
import { MESSAGE_REPOSITORY } from './domain/ports/message.repository.js';
import { ChatController } from './infrastructure/http/chat.controller.js';
import { DrizzleChatRepository } from './infrastructure/persistence/drizzle-chat.repository.js';
import { DrizzleMessageRepository } from './infrastructure/persistence/drizzle-message.repository.js';
import { ChatGateway } from './infrastructure/ws/chat.gateway.js';
import { SocketChatNotifier } from './infrastructure/ws/socket-chat.notifier.js';

@Module({
  imports: [UsersModule],
  controllers: [ChatController],
  providers: [
    ChatAccessService,
    CreateChatUseCase,
    ListMyChatsUseCase,
    ListMessagesUseCase,
    SendMessageUseCase,
    ListMyChatIdsUseCase,
    ChatGateway,
    SocketChatNotifier,
    { provide: CHAT_NOTIFIER, useExisting: SocketChatNotifier },
    { provide: CHAT_REPOSITORY, useClass: DrizzleChatRepository },
    { provide: MESSAGE_REPOSITORY, useClass: DrizzleMessageRepository },
  ],
})
export class ChatsModule {}
