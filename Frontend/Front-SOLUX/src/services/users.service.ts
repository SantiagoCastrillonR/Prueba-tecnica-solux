import { api } from '@/lib/api';
import type { User } from '@/types';

export const usersService = {
  list: (limit = 100) => api<User[]>(`/users?limit=${limit}`),
};
