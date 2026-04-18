"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RealtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let RealtimeService = RealtimeService_1 = class RealtimeService {
    constructor() {
        this.logger = new common_1.Logger(RealtimeService_1.name);
        this.eventSubject = new rxjs_1.Subject();
        this.connectedUsers = new Map();
    }
    sendToUser(userId, event) {
        this.eventSubject.next({ userId, event });
        this.logger.debug(`Event sent to user ${userId}: ${event.type}`);
    }
    broadcastToUsers(userIds, event) {
        for (const userId of userIds) {
            this.sendToUser(userId, event);
        }
    }
    getUserStream(userId) {
        return this.eventSubject.asObservable().pipe((0, operators_1.filter)(ue => ue.userId === userId), (0, operators_1.map)(ue => ue.event));
    }
    registerConnection(userId, socketId) {
        if (!this.connectedUsers.has(userId)) {
            this.connectedUsers.set(userId, new Set());
        }
        this.connectedUsers.get(userId).add(socketId);
        this.logger.log(`User ${userId} connected via socket ${socketId}`);
    }
    removeConnection(userId, socketId) {
        const sockets = this.connectedUsers.get(userId);
        if (sockets) {
            sockets.delete(socketId);
            if (sockets.size === 0)
                this.connectedUsers.delete(userId);
        }
        this.logger.log(`User ${userId} disconnected socket ${socketId}`);
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId) && this.connectedUsers.get(userId).size > 0;
    }
    getOnlineUserIds() {
        return Array.from(this.connectedUsers.keys());
    }
    getConnectionCount(userId) {
        return this.connectedUsers.get(userId)?.size || 0;
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = RealtimeService_1 = __decorate([
    (0, common_1.Injectable)()
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map