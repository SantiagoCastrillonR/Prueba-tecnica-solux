import { z } from 'zod';

export const MESSAGE_MAX_LENGTH = 2000;
export const CHAT_NAME_MAX_LENGTH = 100;

export const createChatSchema = z.object({
  participantIds: z
    .array(z.string())
    .min(1, 'Selecciona al menos una persona')
    .max(50, 'Un chat admite hasta 50 participantes'),
  name: z
    .string()
    .trim()
    .max(CHAT_NAME_MAX_LENGTH, 'El nombre admite hasta 100 caracteres')
    .optional(),
});

export const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Escribe un mensaje')
    .max(MESSAGE_MAX_LENGTH, 'El mensaje admite hasta 2000 caracteres'),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;
