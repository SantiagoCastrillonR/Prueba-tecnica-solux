'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { isUnauthorized } from '@/lib/errors';
import type { LoginInput, RegisterInput } from '@/schemas/auth';
import type { User } from '@/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  expireSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const controller = new AbortController();
    authService
      .me(controller.signal)
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(error)) void authService.logout().catch(() => {});
        setUser(null);
        setStatus('unauthenticated');
      });
    return () => controller.abort();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const me = await authService.login(input);
    setUser(me);
    setStatus('authenticated');
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      await authService.register(input);
      await login({ email: input.email, password: input.password });
    },
    [login]
  );

  const expireSession = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
    void authService.logout().catch(() => {});
    router.replace('/login');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    setUser(null);
    setStatus('unauthenticated');
    router.replace('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, status, login, register, logout, expireSession }),
    [user, status, login, register, logout, expireSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
