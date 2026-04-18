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
var GetNotificationStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNotificationStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_notification_stats_query_1 = require("./get-notification-stats.query");
const notification_core_service_1 = require("../../../services/notification-core.service");
let GetNotificationStatsHandler = GetNotificationStatsHandler_1 = class GetNotificationStatsHandler {
    constructor(notificationCore) {
        this.notificationCore = notificationCore;
        this.logger = new common_1.Logger(GetNotificationStatsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.notificationCore.getStats(query.userId);
        }
        catch (error) {
            this.logger.error(`GetNotificationStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetNotificationStatsHandler = GetNotificationStatsHandler;
exports.GetNotificationStatsHandler = GetNotificationStatsHandler = GetNotificationStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_notification_stats_query_1.GetNotificationStatsQuery),
    __metadata("design:paramtypes", [notification_core_service_1.NotificationCoreService])
], GetNotificationStatsHandler);
//# sourceMappingURL=get-notification-stats.handler.js.map