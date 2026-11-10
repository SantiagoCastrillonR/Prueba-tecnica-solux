'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ChatsProvider } from '@/providers/ChatsProvider';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ConnectionBanner } from '@/components/chat/ConnectionBanner';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';

function ShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const conversationOpen = pathname !== '/chats';

  return (
    <div className='flex h-dvh flex-col'>
      <ConnectionBanner />
      <div className='flex min-h-0 flex-1'>
        <aside
          className={cn(
            'w-full shrink-0 border-r border-ink-200 md:block md:w-80 lg:w-96',
            conversationOpen ? 'hidden' : 'block'
          )}
        >
          <ChatSidebar />
        </aside>
        <section
          className={cn(
            'min-w-0 flex-1 bg-ink-50 md:flex',
            conversationOpen ? 'flex' : 'hidden'
          )}
        >
          {children}
        </section>
      </div>
    </div>
  );
}

export function ChatShell({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <main className='grid min-h-dvh place-items-center'>
        <Spinner className='size-8 text-brand-600' label='Cargando sesión' />
      </main>
    );
  }

  return (
    <ChatsProvider>
      <ShellLayout>{children}</ShellLayout>
    </ChatsProvider>
  );
}
