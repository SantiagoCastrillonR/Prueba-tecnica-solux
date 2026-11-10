export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  sub: string;
  email: string;
}

export interface VerifiedToken extends TokenPayload {
  sessionId: string;
  expiresAt: Date;
}

export interface IssuedToken {
  token: string;
  expiresIn: number;
}

export interface TokenService {
  sign(payload: TokenPayload): Promise<IssuedToken>;
  verify(token: string): Promise<VerifiedToken>;
}
