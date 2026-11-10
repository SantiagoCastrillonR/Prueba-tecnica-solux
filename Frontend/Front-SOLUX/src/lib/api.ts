import { env } from '@/lib/env';
import type { ApiErrorBody } from '@/types';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export async function api<T>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {}
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
      method,
      credentials: 'include',
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'No se pudo conectar con el servidor'
    );
  }

  if (!response.ok) {
    const data = (await response
      .json()
      .catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? 'Error inesperado');
    throw new ApiError(response.status, data?.code ?? 'UNKNOWN', message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
