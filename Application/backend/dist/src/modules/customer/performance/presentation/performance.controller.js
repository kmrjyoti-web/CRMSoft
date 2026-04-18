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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_target_dto_1 = require("./dto/create-target.dto");
const update_target_dto_1 = require("./dto/update-target.dto");
const target_query_dto_1 = require("./dto/target-query.dto");
const create_target_command_1 = require("../application/commands/create-target/create-target.command");
const update_target_command_1 = require("../application/commands/update-target/update-target.command");
const delete_target_command_1 = require("../application/commands/delete-target/delete-target.command");
const list_targets_query_1 = require("../application/queries/list-targets/list-targets.query");
const get_target_query_1 = require("../application/queries/get-target/get-target.query");
const get_leaderboard_query_1 = require("../application/queries/get-leaderboard/get-leaderboard.query");
const get_team_performance_query_1 = require("../application/queries/get-team-performance/get-team-performance.query");
let PerformanceController = class PerformanceController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async listTargets(query) {
        const result = await this.queryBus.execute(new list_targets_query_1.ListTargetsQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.userId, query.period, query.metric, query.isActive));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getTarget(id) {
        const result = await this.queryBus.execute(new get_target_query_1.GetTargetQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async createTarget(dto, userId) {
        const result = await this.commandBus.execute(new create_target_command_1.CreateTargetCommand(userId, dto.metric, dto.targetValue, dto.period, dto.periodStart, dto.periodEnd, dto.name, dto.userId, dto.roleId, dto.notes));
        return api_response_1.ApiResponse.success(result, 'Target created');
    }
    async updateTarget(id, dto, userId) {
        const result = await this.commandBus.execute(new update_target_command_1.UpdateTargetCommand(id, userId, dto));
        return api_response_1.ApiResponse.success(result, 'Target updated');
    }
    async deleteTarget(id, userId) {
        const result = await this.commandBus.execute(new delete_target_command_1.DeleteTargetCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Target deleted');
    }
    async getLeaderboard(period, limit) {
        const result = await this.queryBus.execute(new get_leaderboard_query_1.GetLeaderboardQuery(period, limit ? Number(limit) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async getTeamPerformance(period) {
        const result = await this.queryBus.execute(new get_team_performance_query_1.GetTeamPerformanceQuery(period));
        return api_response_1.ApiResponse.success(result);
    }
    async trackingByUser(userId, query) {
        const result = await this.queryBus.execute(new list_targets_query_1.ListTargetsQuery(query.page, query.limit, query.sortBy, query.sortOrder, userId, query.period, query.metric, query.isActive));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Get)('targets'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [target_query_dto_1.TargetQueryDto]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "listTargets", null);
__decorate([
    (0, common_1.Get)('targets/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getTarget", null);
__decorate([
    (0, common_1.Post)('targets'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_target_dto_1.CreateTargetDto, String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "createTarget", null);
__decorate([
    (0, common_1.Patch)('targets/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_target_dto_1.UpdateTargetDto, String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "updateTarget", null);
__decorate([
    (0, common_1.Delete)('targets/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "deleteTarget", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('team'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getTeamPerformance", null);
__decorate([
    (0, common_1.Get)('tracking/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, target_query_dto_1.TargetQueryDto]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "trackingByUser", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, common_1.Controller)('performance'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map