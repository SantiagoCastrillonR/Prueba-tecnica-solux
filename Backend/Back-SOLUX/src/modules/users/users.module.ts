import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/ports/user.repository.js';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import { GetUserUseCase } from './application/use-cases/get-user.use-case.js';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case.js';
import { UserController } from './infrastructure/http/user.controller.js';
import { DrizzleUserRepository } from './infrastructure/persistence/drizzle-user.repository.js';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
  ],
  exports: [CreateUserUseCase, GetUserUseCase, USER_REPOSITORY],
})
export class UsersModule {}
