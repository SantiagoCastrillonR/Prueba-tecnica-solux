import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@shared/domain/domain.exception.js';

export class ChatNotFoundException extends DomainException {
  readonly code = 'CHAT_NOT_FOUND';

  readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(id: string) {
    super(`Chat with id ${id} not found`, { id });
  }
}

export class ChatAccessForbiddenException extends DomainException {
  readonly code = 'CHAT_ACCESS_FORBIDDEN';

  readonly httpStatus = HttpStatus.FORBIDDEN;

  constructor() {
    super('You are not a participant of this chat');
  }
}

export class InvalidChatDataException extends DomainException {
  readonly code = 'INVALID_CHAT_DATA';

  readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(reason: string) {
    super(`Invalid chat data: ${reason}`, { reason });
  }
}

export class InvalidMessageDataException extends DomainException {
  readonly code = 'INVALID_MESSAGE_DATA';

  readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(reason: string) {
    super(`Invalid message data: ${reason}`, { reason });
  }
}

export class DirectChatAlreadyExistsException extends DomainException {
  readonly code = 'DIRECT_CHAT_ALREADY_EXISTS';

  readonly httpStatus = HttpStatus.CONFLICT;

  constructor(directKey: string) {
    super('A direct chat between these users already exists', { directKey });
  }
}
