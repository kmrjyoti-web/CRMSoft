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
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const dashboard_query_dto_1 = require("./dto/dashboard-query.dto");
const target_dto_1 = require("./dto/target.dto");
const get_team_performance_query_1 = require("../application/queries/get-team-performance/get-team-performance.query");
const get_leaderboard_query_1 = require("../application/queries/get-leaderboard/get-leaderboard.query");
const get_target_tracking_query_1 = require("../application/queries/get-target-tracking/get-target-tracking.query");
const create_target_command_1 = require("../application/commands/create-target/create-target.command");
const update_target_command_1 = require("../application/commands/update-target/update-target.command");
const delete_target_command_1 = require("../application/commands/delete-target/delete-target.command");
let PerformanceController = class PerformanceController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async team(q) {
        const result = await this.queryBus.execute(new get_team_performance_query_1.GetTeamPerformanceQuery(new Date(q.dateFrom), new Date(q.dateTo), q.roleId));
        return api_response_1.ApiResponse.success(result);
    }
    async leaderboard(q, userId) {
        const result = await this.queryBus.execute(new get_leaderboard_query_1.GetLeaderboardQuery(new Date(q.dateFrom), new Date(q.dateTo), q.metric || 'score', 10, userId));
        return api_response_1.ApiResponse.success(result);
    }
    async targetTracking(q) {
        const result = await this.queryBus.execute(new get_target_tracking_query_1.GetTargetTrackingQuery(q.period, q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async createTarget(dto, userId) {
        const result = await this.commandBus.execute(new create_target_command_1.CreateTargetCommand(dto.metric, dto.targetValue, dto.period, new Date(dto.periodStart), new Date(dto.periodEnd), userId, dto.userId, dto.roleId, dto.name, dto.notes));
        return api_response_1.ApiResponse.success(result, 'Target created');
    }
    async listTargets() {
        const result = await this.queryBus.execute(new get_target_tracking_query_1.GetTargetTrackingQuery());
        return api_response_1.ApiResponse.success(result);
    }
    async updateTarget(id, dto) {
        const result = await this.commandBus.execute(new update_target_command_1.UpdateTargetCommand(id, dto.targetValue, dto.name, dto.notes));
        return api_response_1.ApiResponse.success(result, 'Target updated');
    }
    async deleteTarget(id) {
        const result = await this.commandBus.execute(new delete_target_command_1.DeleteTargetCommand(id));
        return api_response_1.ApiResponse.success(result, 'Target deleted');
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Get)('team'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "team", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto, String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "leaderboard", null);
__decorate([
    (0, common_1.Get)('target-tracking'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "targetTracking", null);
__decorate([
    (0, common_1.Post)('targets'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:manage-targets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [target_dto_1.CreateTargetDto, String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "createTarget", null);
__decorate([
    (0, common_1.Get)('targets'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "listTargets", null);
__decorate([
    (0, common_1.Put)('targets/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:manage-targets'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, target_dto_1.UpdateTargetDto]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "updateTarget", null);
__decorate([
    (0, common_1.Delete)('targets/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('performance:manage-targets'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "deleteTarget", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, common_1.Controller)('performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map