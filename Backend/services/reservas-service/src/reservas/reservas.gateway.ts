import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

interface JoinFuncionPayload {
  funcionId: string;
}

interface SeatSelectionPayload {
  funcionId: string;
  seatId: string;
}

@WebSocketGateway({
  namespace: '/reservas',
  cors: {
    origin: '*',
  },
})
export class ReservasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly locksByFuncion = new Map<string, Map<string, string>>();
  private readonly seatsBySocket = new Map<string, Map<string, Set<string>>>();

  handleConnection(_client: Socket) {}

  handleDisconnect(client: Socket) {
    const functions = this.seatsBySocket.get(client.id);

    if (!functions) {
      return;
    }

    functions.forEach((seatIds, funcionId) => {
      seatIds.forEach((seatId) => this.releaseSeat(funcionId, seatId, client.id, false));
      this.emitSeatState(funcionId);
    });

    this.seatsBySocket.delete(client.id);
  }

  @SubscribeMessage('seats:join')
  handleJoin(
    @MessageBody() payload: JoinFuncionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(this.getRoom(payload.funcionId));
    this.emitSeatState(payload.funcionId, client);

    return {
      success: true,
      lockedSeatIds: this.getLockedSeatIds(payload.funcionId),
    };
  }

  @SubscribeMessage('seats:select')
  handleSelect(
    @MessageBody() payload: SeatSelectionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const roomLocks = this.getRoomLocks(payload.funcionId);
    const currentOwner = roomLocks.get(payload.seatId);

    if (currentOwner && currentOwner !== client.id) {
      return {
        success: false,
        message: 'Este asiento acaba de ser tomado por otro usuario.',
        lockedSeatIds: this.getLockedSeatIds(payload.funcionId),
      };
    }

    roomLocks.set(payload.seatId, client.id);
    this.trackSeat(payload.funcionId, payload.seatId, client.id);
    this.emitSeatState(payload.funcionId);

    return {
      success: true,
      lockedSeatIds: this.getLockedSeatIds(payload.funcionId),
    };
  }

  @SubscribeMessage('seats:release')
  handleRelease(
    @MessageBody() payload: SeatSelectionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.releaseSeat(payload.funcionId, payload.seatId, client.id);
    this.emitSeatState(payload.funcionId);

    return {
      success: true,
      lockedSeatIds: this.getLockedSeatIds(payload.funcionId),
    };
  }

  @SubscribeMessage('seats:leave')
  handleLeave(
    @MessageBody() payload: JoinFuncionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const functions = this.seatsBySocket.get(client.id);
    const seatIds = functions?.get(payload.funcionId);

    seatIds?.forEach((seatId) => this.releaseSeat(payload.funcionId, seatId, client.id));
    client.leave(this.getRoom(payload.funcionId));
    this.emitSeatState(payload.funcionId);

    return {
      success: true,
      lockedSeatIds: this.getLockedSeatIds(payload.funcionId),
    };
  }

  releaseSeatsForReservation(funcionId: string, seatIds: string[]) {
    const roomLocks = this.getRoomLocks(funcionId);

    seatIds.forEach((seatId) => {
      const owner = roomLocks.get(seatId);

      if (owner) {
        this.releaseSeat(funcionId, seatId, owner, false);
      }
    });

    this.emitSeatState(funcionId);
  }

  private emitSeatState(funcionId: string, client?: Socket) {
    const payload = {
      funcionId,
      lockedSeatIds: this.getLockedSeatIds(funcionId),
    };

    if (client) {
      client.emit('seats:state', payload);
      return;
    }

    this.server.to(this.getRoom(funcionId)).emit('seats:state', payload);
  }

  private getLockedSeatIds(funcionId: string) {
    return [...this.getRoomLocks(funcionId).keys()];
  }

  private getRoomLocks(funcionId: string) {
    let roomLocks = this.locksByFuncion.get(funcionId);

    if (!roomLocks) {
      roomLocks = new Map<string, string>();
      this.locksByFuncion.set(funcionId, roomLocks);
    }

    return roomLocks;
  }

  private trackSeat(funcionId: string, seatId: string, socketId: string) {
    let functions = this.seatsBySocket.get(socketId);

    if (!functions) {
      functions = new Map<string, Set<string>>();
      this.seatsBySocket.set(socketId, functions);
    }

    let seatIds = functions.get(funcionId);

    if (!seatIds) {
      seatIds = new Set<string>();
      functions.set(funcionId, seatIds);
    }

    seatIds.add(seatId);
  }

  private releaseSeat(funcionId: string, seatId: string, socketId: string, cleanupSocket = true) {
    const roomLocks = this.getRoomLocks(funcionId);

    if (roomLocks.get(seatId) !== socketId) {
      return;
    }

    roomLocks.delete(seatId);

    if (roomLocks.size === 0) {
      this.locksByFuncion.delete(funcionId);
    }

    if (!cleanupSocket) {
      return;
    }

    const functions = this.seatsBySocket.get(socketId);
    const seatIds = functions?.get(funcionId);

    seatIds?.delete(seatId);

    if (seatIds && seatIds.size === 0) {
      functions?.delete(funcionId);
    }

    if (functions && functions.size === 0) {
      this.seatsBySocket.delete(socketId);
    }
  }

  private getRoom(funcionId: string) {
    return `funcion:${funcionId}`;
  }
}
