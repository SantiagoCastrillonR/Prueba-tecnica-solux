import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray, ne } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@shared/database/database.tokens.js';
import type { Database } from '@shared/database/database.module.js';
import { pgError, PG_UNIQUE_VIOLATION } from '@shared/database/pg-errors.js';
import type { User } from '../../domain/entities/user.entity.js';
import { UserAlreadyExistsException } from '../../domain/exceptions/user.exceptions.js';
import type {
  ListUsersOptions,
  UserRepository,
} from '../../domain/ports/user.repository.js';
import { users } from './user.schema.js';
import { UserMapper } from './user.mapper.js';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll({
    limit,
    offset,
    excludeId,
  }: ListUsersOptions): Promise<User[]> {
    const rows = await this.db
      .select()
      .from(users)
      .where(excludeId ? ne(users.id, excludeId) : undefined)
      .orderBy(asc(users.name), asc(users.id))
      .limit(limit)
      .offset(offset);
    return rows.map(UserMapper.toDomain);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const rows = await this.db
      .select()
      .from(users)
      .where(inArray(users.id, ids));
    return rows.map(UserMapper.toDomain);
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return row ? UserMapper.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    try {
      const [row] = await this.db
        .insert(users)
        .values(UserMapper.toPersistence(user))
        .returning();
      return UserMapper.toDomain(row);
    } catch (err) {
      if (pgError(err)?.code === PG_UNIQUE_VIOLATION) {
        throw new UserAlreadyExistsException(user.email);
      }
      throw err;
    }
  }
}
