import { io } from 'socket.io-client';
import { env } from '@/lib/env';
import type { AppSocket } from '@/types';

export function createSocket(): AppSocket {
  return io(env.NEXT_PUBLIC_WS_URL, {
    withCredentials: true,
    autoConnect: false,
  });
}
