import { ApiError } from '@/lib/api';

const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'No se pudo conectar con el servidor. Revisa tu conexión.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  USER_ALREADY_EXISTS: 'Este correo ya está registrado.',
  INVALID_TOKEN: 'Tu sesión expiró. Inicia sesión de nuevo.',
  CHAT_NOT_FOUND: 'La conversación no existe.',
  CHAT_ACCESS_FORBIDDEN: 'No participas en esta conversación.',
  USER_NOT_FOUND: 'El usuario no existe.',
  VALIDATION_ERROR: 'Revisa los datos ingresados.',
  INTERNAL_ERROR: 'Ocurrió un error en el servidor. Inténtalo de nuevo.',
};

export function getErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado.'
): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    }
    return MESSAGES[error.code] ?? fallback;
  }
  return fallback;
}

export function messageForCode(code: string, fallback?: string): string {
  return MESSAGES[code] ?? fallback ?? 'Ocurrió un error inesperado.';
}

export const isUnauthorized = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 401;
