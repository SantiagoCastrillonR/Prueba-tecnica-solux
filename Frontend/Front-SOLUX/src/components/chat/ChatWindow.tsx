'use client';

import { Fragment, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { useChatMessages } from '@/hooks/useChatMessages';
import { chatTitle, formatDayLabel, isSameDay } from '@/lib/format';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

function MessagesSkeleton() {
  return (
    <div className='space-y-3 p-4' aria-label='Cargando mensajes'>
      {[
        'w-2/5 self-start',
        'w-1/2 self-end',
        'w-1/3 self-start',
        'w-3/5 self-end',
      ].map((cls) => (
        <div key={cls} className='flex flex-col'>
          <Skeleton className={`h-12 rounded-2xl ${cls}`} />
        </div>
      ))}
    </div>
  );
}

export function ChatWindow({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const { chats, status: chatsStatus } = useChats();
  const {
    messages,
    status,
    error,
    hasMore,
    loadingMore,
    send,
    retry,
    loadOlder,
    retryLoad,
  } = useChatMessages(chatId);

  const chat = chats.find((c) => c.id === chatId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const prevScrollHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (prevScrollHeight.current !== null) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  if (!user) return null;

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const handleSend = (body: string) => {
    stickToBottom.current = true;
    send(body);
  };

  const handleLoadOlder = () => {
    prevScrollHeight.current = scrollRef.current?.scrollHeight ?? null;
    void loadOlder();
  };

  const title = chat ? chatTitle(chat, user.id) : '';
  const notFound = chatsStatus === 'ready' && !chat;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className='flex min-w-0 flex-1 flex-col'
    >
      <header className='flex items-center gap-3 border-b border-ink-200 bg-white px-3 py-3 sm:px-4'>
        <Link
          href='/chats'
          aria-label='Volver a la lista de chats'
          className='rounded-lg p-2 text-ink-600 hover:bg-ink-100 md:hidden'
        >
          ←
        </Link>
        {chat ? (
          <>
            <Avatar name={title} />
            <div className='min-w-0'>
              <h1 className='truncate text-sm font-semibold text-ink-900'>
                {title}
              </h1>
              {chat.isGroup && (
                <p className='truncate text-xs text-ink-500'>
                  {chat.members.length} participantes
                </p>
              )}
            </div>
          </>
        ) : (
          <div className='flex items-center gap-3'>
            <Skeleton className='size-11 rounded-full' />
            <Skeleton className='h-4 w-32' />
          </div>
        )}
      </header>

      {notFound ? (
        <div className='flex flex-1 items-center justify-center p-6'>
          <Alert>
            No encontramos esta conversación o no participas en ella.
          </Alert>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className='flex-1 scrollbar-thin overflow-y-auto'
          >
            {status === 'loading' && <MessagesSkeleton />}

            {status === 'error' && (
              <div className='mx-auto max-w-sm space-y-3 p-6'>
                <Alert>{error}</Alert>
                <Button variant='secondary' onClick={retryLoad}>
                  Reintentar
                </Button>
              </div>
            )}

            {status === 'ready' && (
              <div className='mx-auto flex min-h-full max-w-3xl flex-col justify-end px-3 py-4 sm:px-4'>
                {hasMore && (
                  <div className='mb-3 flex justify-center'>
                    <Button
                      variant='secondary'
                      onClick={handleLoadOlder}
                      loading={loadingMore}
                      className='px-3 py-1.5 text-xs'
                    >
                      Cargar mensajes anteriores
                    </Button>
                  </div>
                )}

                {messages.length === 0 && (
                  <p className='py-10 text-center text-sm text-ink-500'>
                    Aún no hay mensajes. ¡Escribe el primero!
                  </p>
                )}

                <ul
                  role='log'
                  aria-live='polite'
                  aria-label='Mensajes'
                  className='space-y-1.5'
                >
                  {messages.map((message, index) => {
                    const previous = messages[index - 1];
                    const newDay =
                      !previous ||
                      !isSameDay(previous.createdAt, message.createdAt);
                    return (
                      <Fragment key={message.clientId}>
                        {newDay && (
                          <li className='my-3 text-center text-xs font-medium text-ink-400'>
                            {formatDayLabel(message.createdAt)}
                          </li>
                        )}
                        <MessageBubble
                          message={message}
                          mine={message.sender.id === user.id}
                          onRetry={retry}
                        />
                      </Fragment>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {status === 'ready' && error && (
            <div className='px-3 pb-2'>
              <Alert>{error}</Alert>
            </div>
          )}

          <MessageComposer onSend={handleSend} />
        </>
      )}
    </motion.div>
  );
}
