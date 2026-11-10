'use client';

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createSocket } from '@/lib/socket';
import type { AppSocket, SocketStatus } from '@/types';

export interface SocketContextValue {
  socket: AppSocket | null;
  status: SocketStatus;
  reconnects: number;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketState extends SocketContextValue {
  userId: string | null;
}

const IDLE: SocketState = {
  socket: null,
  status: 'disconnected',
  reconnects: 0,
  userId: null,
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, expireSession } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<SocketState>(IDLE);

  useEffect(() => {
    if (!userId) return;

    const socket = createSocket();
    let hasConnected = false;
    const patch = (next: Partial<SocketState>) =>
      setState((prev) =>
        prev.socket === socket ? { ...prev, ...next } : prev
      );

    socket.on('connect', () => {
      const isReconnect = hasConnected;
      hasConnected = true;
      setState((prev) =>
        prev.socket === socket
          ? {
              ...prev,
              status: 'connected',
              reconnects: prev.reconnects + (isReconnect ? 1 : 0),
            }
          : prev
      );
    });
    socket.on('disconnect', (reason) =>
      patch({
        status:
          reason === 'io client disconnect' ? 'disconnected' : 'reconnecting',
      })
    );
    socket.on('connect_error', (error) => {
      if (error.message === 'UNAUTHORIZED') {
        socket.disconnect();
        expireSession();
        return;
      }
      patch({ status: 'reconnecting' });
    });
    socket.io.on('reconnect_attempt', () => patch({ status: 'reconnecting' }));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ socket, status: 'connecting', reconnects: 0, userId });
    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      socket.disconnect();
      setState(IDLE);
    };
  }, [userId, expireSession]);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket: state.userId === userId ? state.socket : null,
      status: state.userId === userId ? state.status : 'disconnected',
      reconnects: state.reconnects,
    }),
    [state, userId]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
