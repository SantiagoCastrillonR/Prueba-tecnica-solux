import type { Socket } from 'socket.io-client';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  chatId: string;
  sender: Member;
  body: string;
  clientId: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  name: string | null;
  isGroup: boolean;
  members: Member[];
  lastMessage: Message | null;
  createdAt: string;
}

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string | string[];
  details?: Record<string, unknown>;
}

export type SocketStatus =
  'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface SendMessagePayload {
  chatId: string;
  body: string;
  clientId: string;
}

export interface AckError {
  ok: false;
  error: { code: string; message: string };
}

export type MessageAck = { ok: true; message: Message } | AckError;

export interface ServerToClientEvents {
  'chat:message': (message: Message) => void;
  'chat:created': (payload: { chat: Chat }) => void;
}

export interface ClientToServerEvents {
  'chat:message': (
    payload: SendMessagePayload,
    ack: (response: MessageAck) => void
  ) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
