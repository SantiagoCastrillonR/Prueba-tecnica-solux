import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { parse } from 'cookie';
import type { Namespace, Server, ServerOptions, Socket } from 'socket.io';
import type { VerifiedToken } from '../../domain/ports/token.service.js';
import { AUTH_COOKIE } from '../http/auth-cookie.js';
import type { AuthenticatedUser } from '../http/current-user.decorator.js';

export interface SocketData {
  user: AuthenticatedUser;
  sessionId: string;
}

export type AuthenticatedSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  SocketData
>;

export interface SessionVerifier {
  verify(token: string): Promise<VerifiedToken>;
}

export const sessionRoom = (sessionId: string): string =>
  `session:${sessionId}`;

type SocketMiddleware = (
  socket: Pick<Socket, 'request' | 'data' | 'join'>,
  next: (err?: Error) => void,
) => void;

export function socketAuthMiddleware(
  sessions: SessionVerifier,
): SocketMiddleware {
  return (socket, next) => {
    const token = parse(socket.request.headers.cookie ?? '')[AUTH_COOKIE];
    if (!token) {
      next(new Error('UNAUTHORIZED'));
      return;
    }
    sessions
      .verify(token)
      .then(async (session) => {
        const data = socket.data as SocketData;
        data.user = { id: session.sub, email: session.email };
        data.sessionId = session.sessionId;
        await socket.join(sessionRoom(session.sessionId));
        next();
      })
      .catch(() => next(new Error('UNAUTHORIZED')));
  };
}

export class SocketAuthAdapter extends IoAdapter {
  private readonly authenticate: SocketMiddleware;

  constructor(
    app: INestApplicationContext,
    sessions: SessionVerifier,
    private readonly corsOrigins: string[] | undefined,
  ) {
    super(app);
    this.authenticate = socketAuthMiddleware(sessions);
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      ...(this.corsOrigins && {
        cors: { origin: this.corsOrigins, credentials: true },
      }),
    } as ServerOptions) as Server;

    server.use(this.authenticate);
    server.on('new_namespace', (namespace: Namespace) => {
      namespace.use(this.authenticate);
    });
    return server;
  }
}
