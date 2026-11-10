import type { z } from 'zod';

export type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

export function validate<S extends z.ZodType>(
  schema: S,
  values: unknown
):
  | { success: true; data: z.infer<S> }
  | { success: false; errors: FieldErrors<z.infer<S>> } {
  const result = schema.safeParse(values);
  if (result.success) return { success: true, data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors: errors as FieldErrors<z.infer<S>> };
}
