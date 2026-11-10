import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PASSWORD_HASHER } from '@shared/security/security.tokens.js';
import type { PasswordHasher } from '@shared/security/ports/password-hasher.service.js';
import { User } from '../../domain/entities/user.entity.js';
import { UserAlreadyExistsException } from '../../domain/exceptions/user.exceptions.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/ports/user.repository.js';
import { CreateUserDto } from '../dtos/create-user.dto.js';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repo: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new UserAlreadyExistsException(dto.email);
    }
    const now = new Date();
    const user = User.create({
      id: randomUUID(),
      email: dto.email,
      name: dto.name,
      passwordHash: await this.hasher.hash(dto.password),
      createdAt: now,
      updatedAt: now,
    });
    return this.repo.save(user);
  }
}
