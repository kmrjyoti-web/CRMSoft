"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const realtime_service_1 = require("../services/realtime.service");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(realtimeService) {
        this.realtimeService = realtimeService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
    }
    handleConnection(client) {
        const userId = this.extractUserId(client);
        if (!userId) {
            client.disconnect();
            return;
        }
        this.realtimeService.registerConnection(userId, client.id);
        void client.join(`user:${userId}`);
        this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    }
    handleDisconnect(client) {
        const userId = this.extractUserId(client);
        if (userId) {
            this.realtimeService.removeConnection(userId, client.id);
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleSubscribe(client, data) {
        void client.join(`user:${data.userId}`);
        return { event: 'subscribed', data: { userId: data.userId } };
    }
    handlePing(client) {
        return { event: 'pong', data: { timestamp: new Date().toISOString() } };
    }
    sendToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    broadcastToUsers(userIds, event, data) {
        for (const userId of userIds) {
            this.sendToUser(userId, event, data);
        }
    }
    extractUserId(client) {
        return client.handshake.query?.userId ||
            client.handshake.auth?.userId ||
            null;
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handlePing", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/notifications',
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map