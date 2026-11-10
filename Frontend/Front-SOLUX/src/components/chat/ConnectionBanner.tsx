'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useSocket } from '@/hooks/useSocket';
import { Spinner } from '@/components/ui/Spinner';

export function ConnectionBanner() {
  const { status } = useSocket();
  const offline = status === 'reconnecting' || status === 'disconnected';

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          role='status'
          aria-live='polite'
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className='overflow-hidden bg-amber-100 text-amber-900'
        >
          <div className='flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium'>
            <Spinner className='size-4' label='Reconectando' />
            Sin conexión. Reintentando…
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
