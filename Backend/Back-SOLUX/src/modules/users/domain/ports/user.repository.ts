import type { User } from '../entities/user.entity.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface ListUsersOptions extends PaginationOptions {
  excludeId?: string;
}

export interface UserRepository {
  findAll(options: ListUsersOptions): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByIds(ids: string[]): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
