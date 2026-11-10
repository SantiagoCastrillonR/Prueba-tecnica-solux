export const SESSION_NOTIFIER = Symbol('SESSION_NOTIFIER');

export interface SessionNotifier {
  sessionEnded(sessionId: string): void;
}
