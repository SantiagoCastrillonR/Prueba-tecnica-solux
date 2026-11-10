'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Skeleton } from '@/components/ui/Skeleton';

function ChatListSkeleton() {
  return (
    <ul className='space-y-1 px-3' aria-label='Cargando chats'>
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className='flex items-center gap-3 py-3'>
          <Skeleton className='size-11 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-3 w-4/5' />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ChatSidebar() {
  const { user, logout } = useAuth();
  const { chats, status, error, reload } = useChats();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  async function onLogout() {
    setLoggingOut(true);
    await logout();
  }

  return (
    <div className='flex h-full flex-col bg-white'>
      <header className='flex items-center justify-between gap-2 bg-ink-950 px-4 py-3'>
        <Logo tone='dark' className='text-xl' />
        <Button onClick={() => setDialogOpen(true)} className='px-3 py-2'>
          <span aria-hidden='true'>＋</span> Nuevo chat
        </Button>
      </header>

      <nav
        aria-label='Conversaciones'
        className='flex-1 scrollbar-thin overflow-y-auto py-2'
      >
        {status === 'loading' && <ChatListSkeleton />}

        {status === 'error' && (
          <div className='space-y-3 px-4 py-4'>
            <Alert>{error}</Alert>
            <Button variant='secondary' onClick={reload}>
              Reintentar
            </Button>
          </div>
        )}

        {status === 'ready' && chats.length === 0 && (
          <div className='px-6 py-12 text-center'>
            <p className='text-sm font-medium text-ink-700'>
              Todavía no tienes conversaciones
            </p>
            <p className='mt-1 text-sm text-ink-500'>
              Crea un chat con alguien para empezar.
            </p>
          </div>
        )}

        {status === 'ready' && chats.length > 0 && (
          <ul className='space-y-0.5 px-2'>
            <AnimatePresence initial={false}>
              {chats.map((chat) => (
                <motion.li
                  key={chat.id}
                  layout='position'
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChatListItem
                    chat={chat}
                    currentUserId={user.id}
                    active={pathname === `/chats/${chat.id}`}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </nav>

      <footer className='flex items-center gap-3 border-t border-ink-200 px-4 py-3'>
        <Avatar name={user.name} size='sm' />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-ink-900'>
            {user.name}
          </p>
          <p className='truncate text-xs text-ink-500'>{user.email}</p>
        </div>
        <Button
          variant='ghost'
          onClick={onLogout}
          loading={loggingOut}
          className='px-3 py-2'
        >
          Salir
        </Button>
      </footer>

      <AnimatePresence>
        {dialogOpen && <NewChatDialog onClose={() => setDialogOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
