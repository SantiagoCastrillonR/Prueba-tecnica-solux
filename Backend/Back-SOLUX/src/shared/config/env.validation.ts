import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

const DURATION_REGEX = /^\d+[smhd]?$/;

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const toBool = ({ value }: { value: unknown }): unknown => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(v)) return true;
    if (['false', '0', 'no', ''].includes(v)) return false;
  }
  return value;
};

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT!: number;

  @IsString()
  API_PREFIX!: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsString()
  DATABASE_URL!: string;

  @Transform(toBool)
  @IsBoolean()
  DATABASE_SSL!: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  COOKIE_SECURE?: boolean;

  @IsString()
  @MinLength(32)
  JWT_SECRET!: string;

  @IsString()
  @Matches(DURATION_REGEX, {
    message:
      'JWT_EXPIRES_IN must be a number optionally suffixed with s/m/h/d (e.g. "1d")',
  })
  JWT_EXPIRES_IN: string = '1d';

  @IsInt()
  @Min(4)
  @Max(15)
  BCRYPT_ROUNDS: number = 10;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const coerced: Record<string, unknown> = { ...config };
  for (const key of ['PORT', 'BCRYPT_ROUNDS']) {
    if (typeof coerced[key] === 'string') coerced[key] = Number(coerced[key]);
  }
  const validated = plainToInstance(EnvironmentVariables, coerced);
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const messages = errors
      .flatMap((e) => Object.values(e.constraints ?? {}))
      .map((m) => `  • ${m}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${messages}`);
  }
  return validated;
}
