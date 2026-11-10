import { InvalidMessageDataException } from '../exceptions/chat.exceptions.js';
import {
  MESSAGE_BODY_MAX_LENGTH,
  MESSAGE_CLIENT_ID_MAX_LENGTH,
} from '../chat.limits.js';
import type { ChatMember } from './chat.entity.js';

export interface MessageProps {
  id: string;
  chatId: string;
  senderId: string;
  clientId: string;
  body: string;
  createdAt: Date;
}

export class Message {
  readonly id: string;

  readonly chatId: string;

  readonly senderId: string;

  readonly clientId: string;

  readonly body: string;

  readonly createdAt: Date;

  private constructor(props: MessageProps) {
    this.id = props.id;
    this.chatId = props.chatId;
    this.senderId = props.senderId;
    this.clientId = props.clientId;
    this.body = props.body;
    this.createdAt = props.createdAt;
  }

  static create(props: MessageProps): Message {
    const body = props.body.trim();
    if (body.length === 0) {
      throw new InvalidMessageDataException('body cannot be empty');
    }
    if (body.length > MESSAGE_BODY_MAX_LENGTH) {
      throw new InvalidMessageDataException(
        `body must be at most ${MESSAGE_BODY_MAX_LENGTH} characters`,
      );
    }
    if (
      props.clientId.length === 0 ||
      props.clientId.length > MESSAGE_CLIENT_ID_MAX_LENGTH
    ) {
      throw new InvalidMessageDataException('clientId is not valid');
    }
    return new Message({ ...props, body });
  }
}

export interface MessageWithSender {
  message: Message;
  sender: ChatMember;
}
