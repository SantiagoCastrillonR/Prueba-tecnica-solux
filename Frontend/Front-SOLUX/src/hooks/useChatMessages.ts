'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { chatsService } from '@/services/chats.service';
import { getErrorMessage, isUnauthorized, messageForCode } from '@/lib/errors';
import {
  lastServerMessage,
  mergeMessages,
  newClientId,
  upsertMessage,
  type UiMessage,
} from '@/lib/messages';
import type { Message } from '@/types';

const PAGE_SIZE = 50;
const ACK_TIMEOUT_MS = 5000;

export type MessagesStatus = 'loading' | 'ready' | 'error';

export function useChatMessages(chatId: string) {
  const { user, expireSession } = useAuth();
  const { socket, reconnects } = useSocket();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [status, setStatus] = useState<MessagesStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const messagesRef = useRef<UiMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    chatsService
      .messages(chatId, { limit: PAGE_SIZE })
      .then((page) => {
        if (cancelled) return;
        setMessages((prev) => mergeMessages(prev, page));
        setHasMore(page.length === PAGE_SIZE);
        setError(null);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isUnauthorized(err)) return expireSession();
        setError(getErrorMessage(err, 'No se pudo cargar la conversación.'));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [chatId, attempt, expireSession]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (message: Message) => {
      if (message.chatId !== chatId) return;
      setMessages((prev) => upsertMessage(prev, message));
    };
    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:message', onMessage);
    };
  }, [socket, chatId]);

  useEffect(() => {
    if (reconnects === 0) return;
    const last = lastServerMessage(messagesRef.current);
    let cancelled = false;
    chatsService
      .messages(chatId, last ? { after: last.id } : { limit: PAGE_SIZE })
      .then((missed) => {
        if (!cancelled) setMessages((prev) => mergeMessages(prev, missed));
      })
      .catch((err: unknown) => {
        if (isUnauthorized(err)) expireSession();
      });
    return () => {
      cancelled = true;
    };
  }, [reconnects, chatId, expireSession]);

  const retryLoad = useCallback(() => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  }, []);

  const loadOlder = useCallback(async () => {
    const first = messagesRef.current.find((m) => !m.status);
    if (!first || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await chatsService.messages(chatId, {
        before: first.id,
        limit: PAGE_SIZE,
      });
      setMessages((prev) => mergeMessages(prev, page));
      setHasMore(page.length === PAGE_SIZE);
    } catch (err) {
      if (isUnauthorized(err)) expireSession();
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, loadingMore, expireSession]);

  const markFailed = useCallback((clientId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.clientId === clientId ? { ...m, status: 'failed' as const } : m
      )
    );
  }, []);

  const deliver = useCallback(
    async (clientId: string, body: string) => {
      if (!socket?.connected) return markFailed(clientId);
      try {
        const ack = await socket
          .timeout(ACK_TIMEOUT_MS)
          .emitWithAck('chat:message', { chatId, body, clientId });
        if (ack.ok) {
          setMessages((prev) => upsertMessage(prev, ack.message));
        } else {
          markFailed(clientId);
          setError(messageForCode(ack.error.code, ack.error.message));
        }
      } catch {
        markFailed(clientId);
      }
    },
    [socket, chatId, markFailed]
  );

  const send = useCallback(
    (body: string) => {
      if (!user) return;
      const clientId = newClientId();
      const optimistic: UiMessage = {
        id: `local-${clientId}`,
        chatId,
        sender: { id: user.id, name: user.name },
        body,
        clientId,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };
      setError(null);
      setMessages((prev) => upsertMessage(prev, optimistic));
      void deliver(clientId, body);
    },
    [user, chatId, deliver]
  );

  const retry = useCallback(
    (clientId: string) => {
      const target = messagesRef.current.find((m) => m.clientId === clientId);
      if (!target) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === clientId ? { ...m, status: 'sending' as const } : m
        )
      );
      void deliver(clientId, target.body);
    },
    [deliver]
  );

  return {
    messages,
    status,
    error,
    hasMore,
    loadingMore,
    send,
    retry,
    loadOlder,
    retryLoad,
  };
}
