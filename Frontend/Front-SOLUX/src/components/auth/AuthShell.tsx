'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';

export function AuthShell({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/chats');
  }, [status, router]);

  if (status !== 'unauthenticated') {
    return (
      <main className='grid min-h-dvh place-items-center bg-white'>
        <Spinner className='size-8 text-brand-600' />
      </main>
    );
  }

  return (
    <main className='relative flex min-h-dvh flex-col overflow-hidden bg-white'>
      <div
        aria-hidden='true'
        className='absolute top-0 left-0 h-28 w-[min(88%,30rem)] bg-ink-950 [clip-path:polygon(0_0,100%_0,15%_100%,0_82%)]'
      />
      <header className='relative z-10 px-6 pt-6 sm:px-10 sm:pt-7'>
        <Logo tone='dark' tagline className='text-2xl sm:text-3xl' />
      </header>

      <div className='relative z-10 flex flex-1 items-center justify-center px-4 pt-8 pb-36'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className='w-full max-w-md'
        >
          <p className='mb-4 text-center text-sm font-medium tracking-wide text-ink-500'>
            Conversaciones en tiempo real
          </p>
          <div className='rounded-2xl border border-ink-200 bg-white p-6 shadow-xl shadow-ink-950/10 sm:p-8'>
            {children}
          </div>
        </motion.div>
      </div>

      <svg
        aria-hidden='true'
        viewBox='0 0 1000 112'
        preserveAspectRatio='none'
        className='pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full'
      >
        <polygon
          points='0,58 640,0 1000,44 1000,112 0,112'
          className='fill-ink-950'
        />
        <polygon points='0,76 644,12 644,28 0,92' className='fill-brand-500' />
      </svg>
    </main>
  );
}
