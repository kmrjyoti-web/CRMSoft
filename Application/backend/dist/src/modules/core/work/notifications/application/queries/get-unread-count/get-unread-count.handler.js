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
var GetUnreadCountHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUnreadCountHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_unread_count_query_1 = require("./get-unread-count.query");
const notification_core_service_1 = require("../../../services/notification-core.service");
let GetUnreadCountHandler = GetUnreadCountHandler_1 = class GetUnreadCountHandler {
    constructor(notificationCore) {
        this.notificationCore = notificationCore;
        this.logger = new common_1.Logger(GetUnreadCountHandler_1.name);
    }
    async execute(query) {
        try {
            return this.notificationCore.getUnreadCount(query.userId);
        }
        catch (error) {
            this.logger.error(`GetUnreadCountHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetUnreadCountHandler = GetUnreadCountHandler;
exports.GetUnreadCountHandler = GetUnreadCountHandler = GetUnreadCountHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_unread_count_query_1.GetUnreadCountQuery),
    __metadata("design:paramtypes", [notification_core_service_1.NotificationCoreService])
], GetUnreadCountHandler);
//# sourceMappingURL=get-unread-count.handler.js.map