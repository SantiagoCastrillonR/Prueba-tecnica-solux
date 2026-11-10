export const REVOKED_SESSION_REPOSITORY = Symbol('REVOKED_SESSION_REPOSITORY');

export interface RevokedSessionRepository {
  revoke(sessionId: string, expiresAt: Date): Promise<void>;
  isRevoked(sessionId: string): Promise<boolean>;
}
