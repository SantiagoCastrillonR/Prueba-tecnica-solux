import { InvalidUserDataException } from '../exceptions/user.exceptions.js';

export const USER_EMAIL_MAX_LENGTH = 254;
export const USER_NAME_MAX_LENGTH = 100;

export interface UserProps {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;

  readonly email: string;

  readonly name: string;

  readonly passwordHash: string;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: UserProps): User {
    const email = props.email.trim();
    const name = props.name.trim();
    if (!email.includes('@') || email.length > USER_EMAIL_MAX_LENGTH) {
      throw new InvalidUserDataException('email is not valid');
    }
    if (name.length === 0 || name.length > USER_NAME_MAX_LENGTH) {
      throw new InvalidUserDataException(
        `name must be 1-${USER_NAME_MAX_LENGTH} characters`,
      );
    }
    if (props.passwordHash.length === 0) {
      throw new InvalidUserDataException('password hash cannot be empty');
    }
    return new User({ ...props, email, name });
  }
}
