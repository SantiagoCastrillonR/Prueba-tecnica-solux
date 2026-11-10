import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CHAT_NAME_MAX_LENGTH } from '../../domain/chat.limits.js';

export const CHAT_MAX_PARTICIPANTS = 50;

export class CreateChatDto {
  @ApiProperty({
    description:
      'The other participants (the caller is added automatically). One user and no name → direct chat.',
    type: [String],
    format: 'uuid',
    example: ['6f1c0e9a-2d7b-4c55-9a51-1b2f0e6d9c11'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(CHAT_MAX_PARTICIPANTS)
  @IsUUID('all', { each: true })
  participantIds!: string[];

  @ApiPropertyOptional({
    description: 'Group name. Giving a name always creates a group.',
    example: 'Equipo SOLUX',
    maxLength: CHAT_NAME_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(CHAT_NAME_MAX_LENGTH)
  name?: string;
}
