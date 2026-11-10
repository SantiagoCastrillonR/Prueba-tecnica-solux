import type { Chat, ChatMember } from '../entities/chat.entity.js';
import type { Message } from '../entities/message.entity.js';

export const CHAT_NOTIFIER = Symbol('CHAT_NOTIFIER');

export interface ChatNotifier {
  chatCreated(chat: Chat): void;
  messageCreated(message: Message, sender: ChatMember): void;
}
