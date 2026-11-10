import {
  Controller,
  Get,
  Inject,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { sql } from 'drizzle-orm';
import { Public } from '@modules/auth/infrastructure/http/public.decorator.js';
import type { Database } from '@shared/database/database.module.js';
import { DATABASE_CONNECTION } from '@shared/database/database.tokens.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  @Get()
  @Public()
  @SkipThrottle()
  @ApiOperation({
    summary: 'Health check: 200 when the API is up and PostgreSQL answers',
  })
  async check(): Promise<{ status: 'ok' }> {
    try {
      await this.db.execute(sql`select 1`);
    } catch (err) {
      this.logger.error(`Database check failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Database unreachable');
    }
    return { status: 'ok' };
  }
}
