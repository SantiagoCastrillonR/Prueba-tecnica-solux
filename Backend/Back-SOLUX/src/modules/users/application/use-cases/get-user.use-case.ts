import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity.js';
import { UserNotFoundException } from '../../domain/exceptions/user.exceptions.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/ports/user.repository.js';

@Injectable()
export class GetUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new UserNotFoundException(id);
    return user;
  }
}
