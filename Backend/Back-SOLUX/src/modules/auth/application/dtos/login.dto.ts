import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { USER_EMAIL_MAX_LENGTH } from '@modules/users/domain/entities/user.entity.js';
import { PASSWORD_MAX_LENGTH } from '@modules/users/application/dtos/create-user.dto.js';

export class LoginDto {
  @ApiProperty({ example: 'jane@doe.com' })
  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  email!: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(1)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
