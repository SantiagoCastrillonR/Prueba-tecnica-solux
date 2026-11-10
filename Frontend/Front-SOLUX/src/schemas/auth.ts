import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo electrónico')
    .pipe(z.email('Ingresa un correo válido')),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa tu nombre')
    .max(100, 'El nombre admite hasta 100 caracteres'),
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo electrónico')
    .max(255, 'El correo admite hasta 255 caracteres')
    .pipe(z.email('Ingresa un correo válido')),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña admite hasta 72 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
