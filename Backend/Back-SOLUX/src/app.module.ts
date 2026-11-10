import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@shared/database/database.module.js';
import { DomainExceptionFilter } from '@shared/filters/domain-exception.filter.js';
import { HealthModule } from '@shared/health/health.module.js';
import { HttpThrottlerGuard } from '@shared/security/http-throttler.guard.js';
import { SecurityModule } from '@shared/security/security.module.js';
import { validateEnv } from '@shared/config/env.validation.js';
import { AuthModule } from '@modules/auth/auth.module.js';
import { UsersModule } from '@modules/users/users.module.js';
import { ChatsModule } from '@modules/chats/chats.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ ttl: 60_000, limit: 100 }],
        skipIf: () => config.get<string>('NODE_ENV') === 'test',
      }),
    }),
    DatabaseModule,
    HealthModule,
    SecurityModule,
    UsersModule,
    AuthModule,
    ChatsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_GUARD, useClass: HttpThrottlerGuard },
  ],
})
export class AppModule {}
