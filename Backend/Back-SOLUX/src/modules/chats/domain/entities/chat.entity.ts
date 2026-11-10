import { InvalidChatDataException } from '../exceptions/chat.exceptions.js';
import {
  CHAT_MIN_OTHER_PARTICIPANTS,
  CHAT_NAME_MAX_LENGTH,
} from '../chat.limits.js';

export interface ChatMember {
  userId: string;
  name: string;
}

export interface ChatProps {
  id: string;
  name: string | null;
  isGroup: boolean;
  directKey: string | null;
  createdBy: string;
  createdAt: Date;
  members: ChatMember[];
}

export interface StartChatInput {
  id: string;
  creator: ChatMember;
  others: ChatMember[];
  name?: string;
  createdAt: Date;
}

export class Chat {
  readonly id: string;

  readonly name: string | null;

  readonly isGroup: boolean;

  readonly directKey: string | null;

  readonly createdBy: string;

  readonly createdAt: Date;

  readonly members: readonly ChatMember[];

  private constructor(props: ChatProps) {
    this.id = props.id;
    this.name = props.name;
    this.isGroup = props.isGroup;
    this.directKey = props.directKey;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.members = props.members;
  }

  static directKeyFor(userA: string, userB: string): string {
    return [userA, userB].sort().join(':');
  }

  static start(input: StartChatInput): Chat {
    const others = input.others.filter(
      (m, i, all) =>
        m.userId !== input.creator.userId &&
        all.findIndex((o) => o.userId === m.userId) === i,
    );
    if (others.length < CHAT_MIN_OTHER_PARTICIPANTS) {
      throw new InvalidChatDataException(
        'a chat needs at least one other participant',
      );
    }
    const name = input.name?.trim() || null;
    const isGroup = name !== null || others.length > 1;
    return Chat.create({
      id: input.id,
      name,
      isGroup,
      directKey: isGroup
        ? null
        : Chat.directKeyFor(input.creator.userId, others[0].userId),
      createdBy: input.creator.userId,
      createdAt: input.createdAt,
      members: [input.creator, ...others],
    });
  }

  static create(props: ChatProps): Chat {
    const ids = props.members.map((m) => m.userId);
    if (new Set(ids).size !== ids.length) {
      throw new InvalidChatDataException('duplicated participant');
    }
    if (!ids.includes(props.createdBy)) {
      throw new InvalidChatDataException('the creator must be a participant');
    }
    if (props.name !== null && props.name.length > CHAT_NAME_MAX_LENGTH) {
      throw new InvalidChatDataException(
        `name must be at most ${CHAT_NAME_MAX_LENGTH} characters`,
      );
    }
    if (props.isGroup) {
      if (props.directKey !== null || ids.length < 2) {
        throw new InvalidChatDataException('a group needs two or more members');
      }
    } else if (
      ids.length !== 2 ||
      props.name !== null ||
      props.directKey !== Chat.directKeyFor(ids[0], ids[1])
    ) {
      throw new InvalidChatDataException(
        'a direct chat has exactly two members and no name',
      );
    }
    return new Chat(props);
  }

  hasMember(userId: string): boolean {
    return this.members.some((m) => m.userId === userId);
  }

  member(userId: string): ChatMember | undefined {
    return this.members.find((m) => m.userId === userId);
  }
}
