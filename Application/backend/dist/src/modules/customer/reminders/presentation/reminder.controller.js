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
exports.ReminderController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_reminder_dto_1 = require("./dto/create-reminder.dto");
const reminder_query_dto_1 = require("./dto/reminder-query.dto");
const create_reminder_command_1 = require("../application/commands/create-reminder/create-reminder.command");
const dismiss_reminder_command_1 = require("../application/commands/dismiss-reminder/dismiss-reminder.command");
const snooze_reminder_command_1 = require("../application/commands/snooze-reminder/snooze-reminder.command");
const cancel_reminder_command_1 = require("../application/commands/cancel-reminder/cancel-reminder.command");
const acknowledge_reminder_command_1 = require("../application/commands/acknowledge-reminder/acknowledge-reminder.command");
const get_reminder_list_query_1 = require("../application/queries/get-reminder-list/get-reminder-list.query");
const get_pending_reminders_query_1 = require("../application/queries/get-pending-reminders/get-pending-reminders.query");
const get_reminder_stats_query_1 = require("../application/queries/get-reminder-stats/get-reminder-stats.query");
const get_manager_reminder_stats_query_1 = require("../application/queries/get-manager-reminder-stats/get-manager-reminder-stats.query");
let ReminderController = class ReminderController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_reminder_command_1.CreateReminderCommand(dto.title, new Date(dto.scheduledAt), dto.recipientId, userId, dto.entityType, dto.entityId, dto.channel, dto.message));
        return api_response_1.ApiResponse.success(result, 'Reminder created');
    }
    async list(query) {
        const result = await this.queryBus.execute(new get_reminder_list_query_1.GetReminderListQuery(query.page, query.limit, query.recipientId, query.channel, query.isSent));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async pending(recipientId, page = 1, limit = 50) {
        const result = await this.queryBus.execute(new get_pending_reminders_query_1.GetPendingRemindersQuery(recipientId, +page, +limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async stats(userId) {
        const result = await this.queryBus.execute(new get_reminder_stats_query_1.GetReminderStatsQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async managerStats(user) {
        const result = await this.queryBus.execute(new get_manager_reminder_stats_query_1.GetManagerReminderStatsQuery(user.id, user.roleLevel ?? 5));
        return api_response_1.ApiResponse.success(result);
    }
    async dismiss(id, userId) {
        const result = await this.commandBus.execute(new dismiss_reminder_command_1.DismissReminderCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Reminder dismissed');
    }
    async snooze(id, userId, snoozedUntil) {
        const result = await this.commandBus.execute(new snooze_reminder_command_1.SnoozeReminderCommand(id, userId, snoozedUntil ? new Date(snoozedUntil) : undefined));
        return api_response_1.ApiResponse.success(result, 'Reminder snoozed');
    }
    async cancel(id, userId) {
        const result = await this.commandBus.execute(new cancel_reminder_command_1.CancelReminderCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Reminder cancelled');
    }
    async acknowledge(id, userId) {
        const result = await this.commandBus.execute(new acknowledge_reminder_command_1.AcknowledgeReminderCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Reminder acknowledged');
    }
};
exports.ReminderController = ReminderController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reminder_dto_1.CreateReminderDto, String]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reminder_query_dto_1.ReminderQueryDto]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:read'),
    __param(0, (0, common_1.Query)('recipientId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "pending", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:read'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('manager-stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "managerStats", null);
__decorate([
    (0, common_1.Post)(':id/dismiss'),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "dismiss", null);
__decorate([
    (0, common_1.Post)(':id/snooze'),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)('snoozedUntil')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "snooze", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/acknowledge'),
    (0, require_permissions_decorator_1.RequirePermissions)('reminders:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "acknowledge", null);
exports.ReminderController = ReminderController = __decorate([
    (0, common_1.Controller)('reminders'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], ReminderController);
//# sourceMappingURL=reminder.controller.js.map