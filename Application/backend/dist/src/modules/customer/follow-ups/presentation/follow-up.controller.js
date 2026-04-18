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
exports.FollowUpController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_follow_up_dto_1 = require("./dto/create-follow-up.dto");
const update_follow_up_dto_1 = require("./dto/update-follow-up.dto");
const snooze_follow_up_dto_1 = require("./dto/snooze-follow-up.dto");
const reassign_follow_up_dto_1 = require("./dto/reassign-follow-up.dto");
const follow_up_query_dto_1 = require("./dto/follow-up-query.dto");
const create_follow_up_command_1 = require("../application/commands/create-follow-up/create-follow-up.command");
const update_follow_up_command_1 = require("../application/commands/update-follow-up/update-follow-up.command");
const complete_follow_up_command_1 = require("../application/commands/complete-follow-up/complete-follow-up.command");
const snooze_follow_up_command_1 = require("../application/commands/snooze-follow-up/snooze-follow-up.command");
const reassign_follow_up_command_1 = require("../application/commands/reassign-follow-up/reassign-follow-up.command");
const delete_follow_up_command_1 = require("../application/commands/delete-follow-up/delete-follow-up.command");
const get_follow_up_list_query_1 = require("../application/queries/get-follow-up-list/get-follow-up-list.query");
const get_follow_up_by_id_query_1 = require("../application/queries/get-follow-up-by-id/get-follow-up-by-id.query");
const get_overdue_follow_ups_query_1 = require("../application/queries/get-overdue-follow-ups/get-overdue-follow-ups.query");
const get_follow_up_stats_query_1 = require("../application/queries/get-follow-up-stats/get-follow-up-stats.query");
let FollowUpController = class FollowUpController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_follow_up_command_1.CreateFollowUpCommand(dto.title, new Date(dto.dueDate), dto.assignedToId, userId, dto.entityType, dto.entityId, dto.description, dto.priority));
        return api_response_1.ApiResponse.success(result, 'Follow-up created');
    }
    async list(query) {
        const result = await this.queryBus.execute(new get_follow_up_list_query_1.GetFollowUpListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.priority, query.assignedToId, query.isOverdue, query.entityType, query.entityId));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async overdue(assignedToId, page = 1, limit = 50) {
        const result = await this.queryBus.execute(new get_overdue_follow_ups_query_1.GetOverdueFollowUpsQuery(assignedToId, +page, +limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async stats(userId, fromDate, toDate) {
        const result = await this.queryBus.execute(new get_follow_up_stats_query_1.GetFollowUpStatsQuery(userId, fromDate, toDate));
        return api_response_1.ApiResponse.success(result);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_follow_up_by_id_query_1.GetFollowUpByIdQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, userId) {
        const data = { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined };
        const result = await this.commandBus.execute(new update_follow_up_command_1.UpdateFollowUpCommand(id, userId, data));
        return api_response_1.ApiResponse.success(result, 'Follow-up updated');
    }
    async complete(id, userId) {
        const result = await this.commandBus.execute(new complete_follow_up_command_1.CompleteFollowUpCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Follow-up completed');
    }
    async snooze(id, dto, userId) {
        const result = await this.commandBus.execute(new snooze_follow_up_command_1.SnoozeFollowUpCommand(id, userId, new Date(dto.snoozedUntil)));
        return api_response_1.ApiResponse.success(result, 'Follow-up snoozed');
    }
    async reassign(id, dto, userId) {
        const result = await this.commandBus.execute(new reassign_follow_up_command_1.ReassignFollowUpCommand(id, userId, dto.newAssigneeId));
        return api_response_1.ApiResponse.success(result, 'Follow-up reassigned');
    }
    async remove(id, userId) {
        const result = await this.commandBus.execute(new delete_follow_up_command_1.DeleteFollowUpCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Follow-up deleted');
    }
};
exports.FollowUpController = FollowUpController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_follow_up_dto_1.CreateFollowUpDto, String]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [follow_up_query_dto_1.FollowUpQueryDto]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('overdue'),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:read'),
    __param(0, (0, common_1.Query)('assignedToId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "overdue", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:read'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_follow_up_dto_1.UpdateFollowUpDto, String]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/snooze'),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, snooze_follow_up_dto_1.SnoozeFollowUpDto, String]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "snooze", null);
__decorate([
    (0, common_1.Post)(':id/reassign'),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reassign_follow_up_dto_1.ReassignFollowUpDto, String]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "reassign", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('follow-ups:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FollowUpController.prototype, "remove", null);
exports.FollowUpController = FollowUpController = __decorate([
    (0, common_1.Controller)('follow-ups'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], FollowUpController);
//# sourceMappingURL=follow-up.controller.js.map