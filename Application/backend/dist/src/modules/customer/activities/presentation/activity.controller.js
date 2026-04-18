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
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const data_masking_interceptor_1 = require("../../../softwarevendor/table-config/data-masking.interceptor");
const create_activity_dto_1 = require("./dto/create-activity.dto");
const update_activity_dto_1 = require("./dto/update-activity.dto");
const complete_activity_dto_1 = require("./dto/complete-activity.dto");
const activity_query_dto_1 = require("./dto/activity-query.dto");
const create_activity_command_1 = require("../application/commands/create-activity/create-activity.command");
const update_activity_command_1 = require("../application/commands/update-activity/update-activity.command");
const complete_activity_command_1 = require("../application/commands/complete-activity/complete-activity.command");
const delete_activity_command_1 = require("../application/commands/delete-activity/delete-activity.command");
const deactivate_activity_command_1 = require("../application/commands/deactivate-activity/deactivate-activity.command");
const reactivate_activity_command_1 = require("../application/commands/reactivate-activity/reactivate-activity.command");
const soft_delete_activity_command_1 = require("../application/commands/soft-delete-activity/soft-delete-activity.command");
const restore_activity_command_1 = require("../application/commands/restore-activity/restore-activity.command");
const permanent_delete_activity_command_1 = require("../application/commands/permanent-delete-activity/permanent-delete-activity.command");
const get_activity_list_query_1 = require("../application/queries/get-activity-list/get-activity-list.query");
const get_activity_by_id_query_1 = require("../application/queries/get-activity-by-id/get-activity-by-id.query");
const get_activities_by_entity_query_1 = require("../application/queries/get-activities-by-entity/get-activities-by-entity.query");
const get_activity_stats_query_1 = require("../application/queries/get-activity-stats/get-activity-stats.query");
let ActivityController = class ActivityController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId, tenantId) {
        const result = await this.commandBus.execute(new create_activity_command_1.CreateActivityCommand(dto.type, dto.subject, userId, dto.description, dto.scheduledAt ? new Date(dto.scheduledAt) : undefined, dto.endTime ? new Date(dto.endTime) : undefined, dto.duration, dto.leadId, dto.contactId, dto.locationName, dto.latitude, dto.longitude, dto.reminderMinutesBefore, dto.taggedUserIds, tenantId));
        return api_response_1.ApiResponse.success(result, 'Activity created');
    }
    async list(query) {
        const result = await this.queryBus.execute(new get_activity_list_query_1.GetActivityListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.isActive, query.type, query.leadId, query.contactId, query.createdById, query.fromDate, query.toDate));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async stats(userId, fromDate, toDate) {
        const result = await this.queryBus.execute(new get_activity_stats_query_1.GetActivityStatsQuery(userId, fromDate, toDate));
        return api_response_1.ApiResponse.success(result);
    }
    async byEntity(type, entityId, page = 1, limit = 20) {
        const result = await this.queryBus.execute(new get_activities_by_entity_query_1.GetActivitiesByEntityQuery(type, entityId, +page, +limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_activity_by_id_query_1.GetActivityByIdQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, userId) {
        const result = await this.commandBus.execute(new update_activity_command_1.UpdateActivityCommand(id, userId, dto));
        return api_response_1.ApiResponse.success(result, 'Activity updated');
    }
    async complete(id, dto, userId) {
        const result = await this.commandBus.execute(new complete_activity_command_1.CompleteActivityCommand(id, userId, dto.outcome));
        return api_response_1.ApiResponse.success(result, 'Activity completed');
    }
    async remove(id, userId) {
        const result = await this.commandBus.execute(new delete_activity_command_1.DeleteActivityCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Activity deleted');
    }
    async deactivate(id) {
        await this.commandBus.execute(new deactivate_activity_command_1.DeactivateActivityCommand(id));
        const result = await this.queryBus.execute(new get_activity_by_id_query_1.GetActivityByIdQuery(id));
        return api_response_1.ApiResponse.success(result, 'Activity deactivated');
    }
    async reactivate(id) {
        await this.commandBus.execute(new reactivate_activity_command_1.ReactivateActivityCommand(id));
        const result = await this.queryBus.execute(new get_activity_by_id_query_1.GetActivityByIdQuery(id));
        return api_response_1.ApiResponse.success(result, 'Activity reactivated');
    }
    async softDelete(id, userId) {
        await this.commandBus.execute(new soft_delete_activity_command_1.SoftDeleteActivityCommand(id, userId));
        const result = await this.queryBus.execute(new get_activity_by_id_query_1.GetActivityByIdQuery(id));
        return api_response_1.ApiResponse.success(result, 'Activity soft-deleted');
    }
    async restore(id) {
        await this.commandBus.execute(new restore_activity_command_1.RestoreActivityCommand(id));
        const result = await this.queryBus.execute(new get_activity_by_id_query_1.GetActivityByIdQuery(id));
        return api_response_1.ApiResponse.success(result, 'Activity restored');
    }
    async permanentDelete(id) {
        await this.commandBus.execute(new permanent_delete_activity_command_1.PermanentDeleteActivityCommand(id));
        return api_response_1.ApiResponse.success({ id, deleted: true }, 'Activity permanently deleted');
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_activity_dto_1.CreateActivityDto, String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(data_masking_interceptor_1.DataMaskingInterceptor),
    (0, data_masking_interceptor_1.MaskTable)('activities'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [activity_query_dto_1.ActivityQueryDto]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:read'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('entity/:type/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:read'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "byEntity", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_activity_dto_1.UpdateActivityDto, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, complete_activity_dto_1.CompleteActivityDto, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "complete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Post)(':id/soft-delete'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, require_permissions_decorator_1.RequirePermissions)('activities:delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "permanentDelete", null);
exports.ActivityController = ActivityController = __decorate([
    (0, common_1.Controller)('activities'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map