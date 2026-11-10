import { api } from '@/lib/api';
import type { LoginInput, RegisterInput } from '@/schemas/auth';
import type { User } from '@/types';

export const authService = {
  register: (input: RegisterInput) =>
    api<User>('/auth/register', { method: 'POST', body: input }),
  login: (input: LoginInput) =>
    api<User>('/auth/login', { method: 'POST', body: input }),
  logout: () => api<void>('/auth/logout', { method: 'POST' }),
  me: (signal?: AbortSignal) => api<User>('/auth/me', { signal }),
};
