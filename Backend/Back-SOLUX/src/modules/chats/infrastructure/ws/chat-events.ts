export const CHAT_EVENTS = {
  message: 'chat:message',
  created: 'chat:created',
} as const;

export const userRoom = (userId: string): string => `user:${userId}`;

export const chatRoom = (chatId: string): string => `chat:${chatId}`;
