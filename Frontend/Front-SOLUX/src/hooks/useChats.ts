'use client';

import { useContext } from 'react';
import {
  ChatsContext,
  type ChatsContextValue,
} from '@/providers/ChatsProvider';

export function useChats(): ChatsContextValue {
  const context = useContext(ChatsContext);
  if (!context)
    throw new Error('useChats debe usarse dentro de <ChatsProvider>');
  return context;
}
