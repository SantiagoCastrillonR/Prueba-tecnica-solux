'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion='user'>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
