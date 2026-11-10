import { HttpStatus } from '@nestjs/common';

export abstract class DomainException extends Error {
  abstract readonly code: string;

  abstract readonly httpStatus: HttpStatus;

  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}
