import type { Logger } from '@nestjs/common';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import { DomainException } from '@shared/domain/domain.exception.js';

export interface ErrorAck {
  ok: false;
  error: { code: string; message: string; details?: Record<string, unknown> };
}

export type Validated<T> = { ok: true; value: T } | ErrorAck;

export async function validatePayload<T extends object>(
  dto: ClassConstructor<T>,
  payload: unknown,
): Promise<Validated<T>> {
  if (typeof payload !== 'object' || payload === null) {
    return validationError(['payload must be an object']);
  }
  const value = plainToInstance(dto, payload);
  const errors = await validate(value, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) {
    return validationError(
      errors.flatMap((e) => Object.values(e.constraints ?? {})),
    );
  }
  return { ok: true, value };
}

export function errorAck(err: unknown, logger: Logger): ErrorAck {
  if (err instanceof DomainException) {
    return {
      ok: false,
      error: { code: err.code, message: err.message, details: err.details },
    };
  }
  logger.error(
    `[INTERNAL_ERROR] ${(err as Error)?.message}`,
    (err as Error)?.stack,
  );
  return {
    ok: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  };
}

function validationError(messages: string[]): ErrorAck {
  return {
    ok: false,
    error: { code: 'VALIDATION_ERROR', message: messages.join(', ') },
  };
}
