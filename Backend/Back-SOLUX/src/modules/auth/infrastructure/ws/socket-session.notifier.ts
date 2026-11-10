import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import type { SessionNotifier } from '../../domain/ports/session.notifier.js';
import { sessionRoom } from './socket-auth.adapter.js';

@WebSocketGateway()
export class SocketSessionNotifier implements SessionNotifier {
  @WebSocketServer()
  private readonly server?: Server;

  sessionEnded(sessionId: string): void {
    this.server?.in(sessionRoom(sessionId)).disconnectSockets(true);
  }
}
