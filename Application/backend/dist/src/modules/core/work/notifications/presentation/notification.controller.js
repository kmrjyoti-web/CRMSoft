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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const send_notification_dto_1 = require("./dto/send-notification.dto");
const notification_query_dto_1 = require("./dto/notification-query.dto");
const send_notification_command_1 = require("../application/commands/send-notification/send-notification.command");
const mark_read_command_1 = require("../application/commands/mark-read/mark-read.command");
const mark_all_read_command_1 = require("../application/commands/mark-all-read/mark-all-read.command");
const dismiss_notification_command_1 = require("../application/commands/dismiss-notification/dismiss-notification.command");
const bulk_mark_read_command_1 = require("../application/commands/bulk-mark-read/bulk-mark-read.command");
const bulk_dismiss_command_1 = require("../application/commands/bulk-dismiss/bulk-dismiss.command");
const get_notifications_query_1 = require("../application/queries/get-notifications/get-notifications.query");
const get_notification_by_id_query_1 = require("../application/queries/get-notification-by-id/get-notification-by-id.query");
const get_unread_count_query_1 = require("../application/queries/get-unread-count/get-unread-count.query");
const get_notification_stats_query_1 = require("../application/queries/get-notification-stats/get-notification-stats.query");
let NotificationController = class NotificationController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async send(dto, userId) {
        const result = await this.commandBus.execute(new send_notification_command_1.SendNotificationCommand(dto.templateName, dto.recipientId, dto.variables, userId, dto.entityType, dto.entityId, dto.priority, dto.groupKey, dto.channelOverrides));
        return api_response_1.ApiResponse.success(result, 'Notification sent');
    }
    async list(query, userId) {
        const result = await this.queryBus.execute(new get_notifications_query_1.GetNotificationsQuery(userId, query.page, query.limit, query.category, query.status, query.priority));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async unreadCount(userId) {
        const result = await this.queryBus.execute(new get_unread_count_query_1.GetUnreadCountQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async stats(userId) {
        const result = await this.queryBus.execute(new get_notification_stats_query_1.GetNotificationStatsQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async getById(id, userId) {
        const result = await this.queryBus.execute(new get_notification_by_id_query_1.GetNotificationByIdQuery(id, userId));
        return api_response_1.ApiResponse.success(result);
    }
    async markRead(id, userId) {
        const result = await this.commandBus.execute(new mark_read_command_1.MarkReadCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Marked as read');
    }
    async markAllRead(userId, category) {
        const result = await this.commandBus.execute(new mark_all_read_command_1.MarkAllReadCommand(userId, category));
        return api_response_1.ApiResponse.success(result, 'All marked as read');
    }
    async dismiss(id, userId) {
        const result = await this.commandBus.execute(new dismiss_notification_command_1.DismissNotificationCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Dismissed');
    }
    async bulkRead(ids, userId) {
        const result = await this.commandBus.execute(new bulk_mark_read_command_1.BulkMarkReadCommand(ids, userId));
        return api_response_1.ApiResponse.success(result, 'Bulk marked as read');
    }
    async bulkDismiss(ids, userId) {
        const result = await this.commandBus.execute(new bulk_dismiss_command_1.BulkDismissCommand(ids, userId));
        return api_response_1.ApiResponse.success(result, 'Bulk dismissed');
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:send'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendNotificationDto, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "send", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_query_dto_1.NotificationQueryDto, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "unreadCount", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllRead", null);
__decorate([
    (0, common_1.Post)(':id/dismiss'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "dismiss", null);
__decorate([
    (0, common_1.Post)('bulk/read'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:update'),
    __param(0, (0, common_1.Body)('ids')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "bulkRead", null);
__decorate([
    (0, common_1.Post)('bulk/dismiss'),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications:update'),
    __param(0, (0, common_1.Body)('ids')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "bulkDismiss", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map