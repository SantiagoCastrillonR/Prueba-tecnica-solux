import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import {
  MESSAGE_BODY_MAX_LENGTH,
  MESSAGE_CLIENT_ID_MAX_LENGTH,
} from '../../domain/chat.limits.js';

export class SendMessageDto {
  @IsUUID('all')
  chatId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MESSAGE_BODY_MAX_LENGTH)
  body!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MESSAGE_CLIENT_ID_MAX_LENGTH)
  clientId!: string;
}
