import { Inject, Injectable } from '@nestjs/common';
import { PASSWORD_HASHER } from '@shared/security/security.tokens.js';
import type { PasswordHasher } from '@shared/security/ports/password-hasher.service.js';
import type { User } from '@modules/users/domain/entities/user.entity.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@modules/users/domain/ports/user.repository.js';
import { InvalidCredentialsException } from '../../domain/exceptions/auth.exceptions.js';
import {
  TOKEN_SERVICE,
  type IssuedToken,
  type TokenService,
} from '../../domain/ports/token.service.js';
import { LoginDto } from '../dtos/login.dto.js';

const DUMMY_PASSWORD_HASH =
  '$2b$10$bRFD7cFrmbNh//NyN4QhN.g8T4MTXstlwQxyAmfqrPLLw3qMa7TQW';

export interface LoginResult {
  user: User;
  session: IssuedToken;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.users.findByEmail(dto.email);

    const ok = await this.hasher.compare(
      dto.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!user || !ok) {
      throw new InvalidCredentialsException();
    }
    const session = await this.tokens.sign({ sub: user.id, email: user.email });
    return { user, session };
  }
}
