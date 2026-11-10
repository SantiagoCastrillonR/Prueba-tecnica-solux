import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AUTH_COOKIE } from '@modules/auth/infrastructure/http/auth-cookie.js';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '@modules/auth/infrastructure/http/current-user.decorator.js';
import { ChatResponse } from '../../application/dtos/chat.response.js';
import { CreateChatDto } from '../../application/dtos/create-chat.dto.js';
import { ListMessagesQueryDto } from '../../application/dtos/list-messages.query.js';
import { MessageResponse } from '../../application/dtos/message.response.js';
import { CreateChatUseCase } from '../../application/use-cases/create-chat.use-case.js';
import { ListMessagesUseCase } from '../../application/use-cases/list-messages.use-case.js';
import { ListMyChatsUseCase } from '../../application/use-cases/list-my-chats.use-case.js';

@ApiTags('chats')
@ApiCookieAuth(AUTH_COOKIE)
@Controller('chats')
export class ChatController {
  constructor(
    private readonly createChat: CreateChatUseCase,
    private readonly listMyChats: ListMyChatsUseCase,
    private readonly listMessages: ListMessagesUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Create a chat with 1+ users (201). Opening an existing direct chat returns it (200).',
  })
  async create(
    @Body() dto: CreateChatDto,
    @CurrentUser() current: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ChatResponse> {
    const { chat, created } = await this.createChat.execute(dto, current.id);
    res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return ChatResponse.fromDomain(chat);
  }

  @Get()
  @ApiOperation({ summary: 'List my chats, most recent activity first' })
  async list(
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<ChatResponse[]> {
    const summaries = await this.listMyChats.execute(current.id);
    return summaries.map((s) => ChatResponse.fromDomain(s.chat, s.lastMessage));
  }

  @Get(':id/messages')
  @ApiOperation({
    summary:
      'Message history (members only), oldest first. `before` pages back, `after` resyncs.',
  })
  async messages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: ListMessagesQueryDto,
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<MessageResponse[]> {
    const page = await this.listMessages.execute(id, query, current.id);
    return page.map(({ message, sender }) =>
      MessageResponse.fromDomain(message, sender),
    );
  }
}
