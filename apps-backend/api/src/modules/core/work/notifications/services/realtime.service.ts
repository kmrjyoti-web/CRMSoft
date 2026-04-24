import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface RealtimeEvent {
  type: string;
  payload: Record<string, unknown>;
}

interface UserEvent {
  userId: string;
  event: RealtimeEvent;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private readonly eventSubject = new Subject<UserEvent>();
  private readonly connectedUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

  sendToUser(userId: string, event: RealtimeEvent) {
    this.eventSubject.next({ userId, event });
    this.logger.debug(`Event sent to user ${userId}: ${event.type}`);
  }

  broadcastToUsers(userIds: string[], event: RealtimeEvent) {
    for (const userId of userIds) {
      this.sendToUser(userId, event);
    }
  }

  getUserStream(userId: string): Observable<RealtimeEvent> {
    return this.eventSubject.asObservable().pipe(
      filter(ue => ue.userId === userId),
      map(ue => ue.event),
    );
  }

  registerConnection(userId: string, socketId: string) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socketId);
    this.logger.log(`User ${userId} connected via socket ${socketId}`);
  }

  removeConnection(userId: string, socketId: string) {
    const sockets = this.connectedUsers.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) this.connectedUsers.delete(userId);
    }
    this.logger.log(`User ${userId} disconnected socket ${socketId}`);
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  getConnectionCount(userId: string): number {
    return this.connectedUsers.get(userId)?.size || 0;
  }
}
