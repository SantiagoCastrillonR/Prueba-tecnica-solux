'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { chatsService } from '@/services/chats.service';
import { getErrorMessage, isUnauthorized } from '@/lib/errors';
import type { Chat, Message } from '@/types';

export type ChatsStatus = 'loading' | 'ready' | 'error';

export interface ChatsContextValue {
  chats: Chat[];
  status: ChatsStatus;
  error: string | null;
  reload: () => void;
  upsertChat: (chat: Chat) => void;
}

export const ChatsContext = createContext<ChatsContextValue | null>(null);

const activity = (chat: Chat): number =>
  Date.parse(chat.lastMessage?.createdAt ?? chat.createdAt);

const sortChats = (chats: Chat[]): Chat[] =>
  [...chats].sort((a, b) => activity(b) - activity(a));

export function ChatsProvider({ children }: { children: ReactNode }) {
  const { expireSession } = useAuth();
  const { socket, reconnects } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [status, setStatus] = useState<ChatsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    chatsService
      .list()
      .then((list) => {
        if (cancelled) return;
        setChats(sortChats(list));
        setError(null);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isUnauthorized(err)) return expireSession();
        setError(getErrorMessage(err, 'No se pudieron cargar tus chats.'));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, reconnects, expireSession]);

  const reload = useCallback(() => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  }, []);

  const upsertChat = useCallback((chat: Chat) => {
    setChats((prev) => {
      const existing = prev.find((c) => c.id === chat.id);
      const merged = {
        ...chat,
        lastMessage: chat.lastMessage ?? existing?.lastMessage ?? null,
      };
      return sortChats([merged, ...prev.filter((c) => c.id !== chat.id)]);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onCreated = ({ chat }: { chat: Chat }) => upsertChat(chat);
    const onMessage = (message: Message) => {
      setChats((prev) => {
        if (!prev.some((c) => c.id === message.chatId)) return prev;
        return sortChats(
          prev.map((c) =>
            c.id === message.chatId ? { ...c, lastMessage: message } : c
          )
        );
      });
    };

    socket.on('chat:created', onCreated);
    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:created', onCreated);
      socket.off('chat:message', onMessage);
    };
  }, [socket, upsertChat]);

  const value = useMemo(
    () => ({ chats, status, error, reload, upsertChat }),
    [chats, status, error, reload, upsertChat]
  );

  return (
    <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>
  );
}
