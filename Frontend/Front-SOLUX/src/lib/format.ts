import type { Chat } from '@/types';

const timeFormat = new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
});

const dayFormat = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export const formatTime = (iso: string): string =>
  timeFormat.format(new Date(iso));

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameDay = (a: string, b: string): boolean =>
  sameDay(new Date(a), new Date(b));

export function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, now)) return 'Hoy';
  if (sameDay(date, yesterday)) return 'Ayer';
  return dayFormat.format(date);
}

export function formatListTime(iso: string): string {
  const date = new Date(iso);
  if (sameDay(date, new Date())) return formatTime(iso);
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function chatTitle(chat: Chat, currentUserId: string): string {
  if (chat.name) return chat.name;
  const others = chat.members.filter((m) => m.id !== currentUserId);
  if (chat.isGroup) return others.map((m) => m.name).join(', ') || 'Grupo';
  return others[0]?.name ?? 'Conversación';
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
