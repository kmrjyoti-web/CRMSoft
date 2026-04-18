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
exports.OwnershipWorkloadController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const passport_1 = require("@nestjs/passport");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const get_workload_dashboard_query_1 = require("../application/queries/get-workload-dashboard/get-workload-dashboard.query");
const get_user_workload_query_1 = require("../application/queries/get-user-workload/get-user-workload.query");
const update_user_capacity_command_1 = require("../application/commands/update-user-capacity/update-user-capacity.command");
const set_user_availability_command_1 = require("../application/commands/set-user-availability/set-user-availability.command");
const update_capacity_dto_1 = require("./dto/update-capacity.dto");
const workload_service_1 = require("../services/workload.service");
let OwnershipWorkloadController = class OwnershipWorkloadController {
    constructor(commandBus, queryBus, workload) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.workload = workload;
    }
    async getDashboard(query) {
        const result = await this.queryBus.execute(new get_workload_dashboard_query_1.GetWorkloadDashboardQuery(query.roleId));
        return api_response_1.ApiResponse.success(result);
    }
    async getUserWorkload(userId) {
        const result = await this.queryBus.execute(new get_user_workload_query_1.GetUserWorkloadQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async updateCapacity(userId, dto) {
        const result = await this.commandBus.execute(new update_user_capacity_command_1.UpdateUserCapacityCommand(userId, dto));
        return api_response_1.ApiResponse.success(result, 'Capacity updated');
    }
    async setAvailability(dto, currentUserId) {
        const result = await this.commandBus.execute(new set_user_availability_command_1.SetUserAvailabilityCommand(dto.userId, dto.isAvailable, dto.unavailableFrom ? new Date(dto.unavailableFrom) : undefined, dto.unavailableTo ? new Date(dto.unavailableTo) : undefined, dto.delegateToId, dto.reason, currentUserId));
        return api_response_1.ApiResponse.success(result, dto.isAvailable ? 'User marked available' : 'User marked unavailable');
    }
    async getRebalanceSuggestions() {
        const result = await this.workload.getRebalanceSuggestions();
        return api_response_1.ApiResponse.success(result);
    }
};
exports.OwnershipWorkloadController = OwnershipWorkloadController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OwnershipWorkloadController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OwnershipWorkloadController.prototype, "getUserWorkload", null);
__decorate([
    (0, common_1.Put)('capacity/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:update'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_capacity_dto_1.UpdateCapacityDto]),
    __metadata("design:returntype", Promise)
], OwnershipWorkloadController.prototype, "updateCapacity", null);
__decorate([
    (0, common_1.Post)('availability'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_capacity_dto_1.SetAvailabilityDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipWorkloadController.prototype, "setAvailability", null);
__decorate([
    (0, common_1.Get)('rebalance-suggestions'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OwnershipWorkloadController.prototype, "getRebalanceSuggestions", null);
exports.OwnershipWorkloadController = OwnershipWorkloadController = __decorate([
    (0, common_1.Controller)('ownership/workload'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        workload_service_1.WorkloadService])
], OwnershipWorkloadController);
//# sourceMappingURL=ownership-workload.controller.js.map