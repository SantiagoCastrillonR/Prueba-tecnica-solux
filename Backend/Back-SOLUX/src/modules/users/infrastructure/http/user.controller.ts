import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AUTH_COOKIE } from '@modules/auth/infrastructure/http/auth-cookie.js';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '@modules/auth/infrastructure/http/current-user.decorator.js';
import { ListUsersQueryDto } from '../../application/dtos/list-users.query.js';
import { UserResponse } from '../../application/dtos/user.response.js';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case.js';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';

@ApiTags('users')
@ApiCookieAuth(AUTH_COOKIE)
@Controller('users')
export class UserController {
  constructor(
    private readonly getUser: GetUserUseCase,
    private readonly listUsers: ListUsersUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List the other users (paginated)' })
  async list(
    @Query() query: ListUsersQueryDto,
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<UserResponse[]> {
    const users = await this.listUsers.execute(
      { limit: query.limit, offset: query.offset },
      current.id,
    );
    return users.map(UserResponse.fromDomain);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  async getOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserResponse> {
    const user = await this.getUser.execute(id);
    return UserResponse.fromDomain(user);
  }
}
