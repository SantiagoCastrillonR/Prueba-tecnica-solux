'use client';

import { useContext } from 'react';
import {
  SocketContext,
  type SocketContextValue,
} from '@/providers/SocketProvider';

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de <SocketProvider>');
  }
  return context;
}
