import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListMessagesQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Return messages older than this one (scroll up).',
  })
  @IsOptional()
  @IsUUID('all')
  before?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Return messages newer than this one (resync after reconnecting).',
  })
  @IsOptional()
  @IsUUID('all')
  after?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
