import { Inject, Injectable } from '@nestjs/common';
import type { User } from '../../domain/entities/user.entity.js';
import {
  USER_REPOSITORY,
  type PaginationOptions,
  type UserRepository,
} from '../../domain/ports/user.repository.js';

@Injectable()
export class ListUsersUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  execute(options: PaginationOptions, currentUserId: string): Promise<User[]> {
    return this.repo.findAll({ ...options, excludeId: currentUserId });
  }
}
