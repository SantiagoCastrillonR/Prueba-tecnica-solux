import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@modules/users/users.module.js';
import { SessionService } from './application/services/session.service.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { REVOKED_SESSION_REPOSITORY } from './domain/ports/revoked-session.repository.js';
import { SESSION_NOTIFIER } from './domain/ports/session.notifier.js';
import { TOKEN_SERVICE } from './domain/ports/token.service.js';
import { AuthController } from './infrastructure/http/auth.controller.js';
import { JwtAuthGuard } from './infrastructure/http/jwt-auth.guard.js';
import { DrizzleRevokedSessionRepository } from './infrastructure/persistence/drizzle-revoked-session.repository.js';
import { JwtTokenService } from './infrastructure/services/jwt-token.service.js';
import { SocketSessionNotifier } from './infrastructure/ws/socket-session.notifier.js';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    SessionService,
    SocketSessionNotifier,
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    {
      provide: REVOKED_SESSION_REPOSITORY,
      useClass: DrizzleRevokedSessionRepository,
    },
    { provide: SESSION_NOTIFIER, useExisting: SocketSessionNotifier },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [SessionService],
})
export class AuthModule {}
