import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from '../services/realtime.service';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly realtimeService;
    server: Server;
    private readonly logger;
    constructor(realtimeService: RealtimeService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, data: {
        userId: string;
    }): {
        event: string;
        data: {
            userId: string;
        };
    };
    handlePing(client: Socket): {
        event: string;
        data: {
            timestamp: string;
        };
    };
    sendToUser(userId: string, event: string, data: any): void;
    broadcastToUsers(userIds: string[], event: string, data: any): void;
    private extractUserId;
}
