import { Observable } from 'rxjs';
export interface RealtimeEvent {
    type: string;
    payload: Record<string, unknown>;
}
export declare class RealtimeService {
    private readonly logger;
    private readonly eventSubject;
    private readonly connectedUsers;
    sendToUser(userId: string, event: RealtimeEvent): void;
    broadcastToUsers(userIds: string[], event: RealtimeEvent): void;
    getUserStream(userId: string): Observable<RealtimeEvent>;
    registerConnection(userId: string, socketId: string): void;
    removeConnection(userId: string, socketId: string): void;
    isUserOnline(userId: string): boolean;
    getOnlineUserIds(): string[];
    getConnectionCount(userId: string): number;
}
