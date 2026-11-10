import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
} from '../../domain/entities/user.entity.js';

export const PASSWORD_MAX_LENGTH = 72;

export class CreateUserDto {
  @ApiProperty({ example: 'jane@doe.com', maxLength: USER_EMAIL_MAX_LENGTH })
  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email!: string;

  @ApiProperty({ example: 'Jane Doe', maxLength: USER_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(1)
  @MaxLength(USER_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({
    example: 'secret123',
    minLength: 8,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
