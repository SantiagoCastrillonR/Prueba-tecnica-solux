export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';

export interface PgErrorInfo {
  code: string;
  constraint?: string;
}

export function pgError(err: unknown): PgErrorInfo | undefined {
  for (const candidate of [err, (err as { cause?: unknown } | null)?.cause]) {
    if (typeof candidate !== 'object' || candidate === null) continue;
    const { code, constraint_name: constraint } = candidate as {
      code?: unknown;
      constraint_name?: unknown;
    };
    if (typeof code === 'string' && /^\d{5}$/.test(code)) {
      return {
        code,
        constraint: typeof constraint === 'string' ? constraint : undefined,
      };
    }
  }
  return undefined;
}
