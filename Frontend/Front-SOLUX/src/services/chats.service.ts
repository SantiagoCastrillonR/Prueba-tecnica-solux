import { api } from '@/lib/api';
import type { CreateChatInput } from '@/schemas/chat';
import type { Chat, Message } from '@/types';

export interface MessagesQuery {
  before?: string;
  after?: string;
  limit?: number;
}

export const chatsService = {
  list: () => api<Chat[]>('/chats'),
  create: (input: CreateChatInput) =>
    api<Chat>('/chats', { method: 'POST', body: input }),
  messages: (chatId: string, { before, after, limit }: MessagesQuery = {}) => {
    const params = new URLSearchParams();
    if (before) params.set('before', before);
    if (after) params.set('after', after);
    if (limit) params.set('limit', String(limit));
    const query = params.size ? `?${params.toString()}` : '';
    return api<Message[]>(`/chats/${chatId}/messages${query}`);
  },
};
