import type { Message } from '@/types';

export interface UiMessage extends Message {
  status?: 'sending' | 'failed';
}

const byTime = (a: UiMessage, b: UiMessage): number =>
  Date.parse(a.createdAt) - Date.parse(b.createdAt);

export function upsertMessage(
  list: UiMessage[],
  incoming: UiMessage
): UiMessage[] {
  const index = list.findIndex(
    (m) => m.id === incoming.id || m.clientId === incoming.clientId
  );
  const next = [...list];
  if (index === -1) next.push(incoming);
  else next[index] = incoming;
  return next.sort(byTime);
}

export const mergeMessages = (
  list: UiMessage[],
  incoming: UiMessage[]
): UiMessage[] => incoming.reduce(upsertMessage, list);

export function newClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export const lastServerMessage = (list: UiMessage[]): UiMessage | undefined =>
  [...list].reverse().find((m) => !m.status);
