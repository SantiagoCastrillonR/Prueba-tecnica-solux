import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CreateUserDto } from '@modules/users/application/dtos/create-user.dto.js';
import { UserResponse } from '@modules/users/application/dtos/user.response.js';
import { CreateUserUseCase } from '@modules/users/application/use-cases/create-user.use-case.js';
import { GetUserUseCase } from '@modules/users/application/use-cases/get-user.use-case.js';
import { LoginDto } from '../../application/dtos/login.dto.js';
import { SessionService } from '../../application/services/session.service.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import {
  AUTH_COOKIE,
  authCookieOptions,
  isCookieSecure,
} from './auth-cookie.js';
import {
  CurrentUser,
  type AuthenticatedUser,
} from './current-user.decorator.js';
import { Public } from './public.decorator.js';

const STRICT_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly secureCookie: boolean;

  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly login: LoginUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly sessions: SessionService,
    config: ConfigService,
  ) {
    this.secureCookie = isCookieSecure(config);
  }

  @Post('register')
  @Public()
  @Throttle(STRICT_THROTTLE)
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: CreateUserDto): Promise<UserResponse> {
    const user = await this.createUser.execute(dto);
    return UserResponse.fromDomain(user);
  }

  @Post('login')
  @Public()
  @Throttle(STRICT_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate with email + password (sets the session cookie)',
  })
  async loginHandler(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponse> {
    const { user, session } = await this.login.execute(dto);
    res.cookie(AUTH_COOKIE, session.token, {
      ...authCookieOptions(this.secureCookie),
      maxAge: session.expiresIn * 1000,
    });
    return UserResponse.fromDomain(user);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'End the session: revokes the token, closes its sockets and clears the cookie (idempotent)',
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookies = req.cookies as Record<string, string> | undefined;
    await this.sessions.end(cookies?.[AUTH_COOKIE]);
    res.clearCookie(AUTH_COOKIE, authCookieOptions(this.secureCookie));
  }

  @Get('me')
  @ApiCookieAuth(AUTH_COOKIE)
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  async me(@CurrentUser() current: AuthenticatedUser): Promise<UserResponse> {
    const user = await this.getUser.execute(current.id);
    return UserResponse.fromDomain(user);
  }
}
