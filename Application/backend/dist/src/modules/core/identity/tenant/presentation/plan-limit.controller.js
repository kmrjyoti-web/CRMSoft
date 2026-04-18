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
exports.PlanLimitController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const super_admin_guard_1 = require("../infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../infrastructure/decorators/super-admin-route.decorator");
const plan_limit_service_1 = require("../services/plan-limit.service");
const upsert_plan_limits_dto_1 = require("./dto/upsert-plan-limits.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let PlanLimitController = class PlanLimitController {
    constructor(planLimitService) {
        this.planLimitService = planLimitService;
    }
    async getLimits(planId) {
        const limits = await this.planLimitService.getByPlan(planId);
        return api_response_1.ApiResponse.success(limits);
    }
    async upsertLimits(planId, dto) {
        const limits = await this.planLimitService.upsertLimits(planId, dto.limits);
        return api_response_1.ApiResponse.success(limits, 'Plan limits updated');
    }
    async deleteLimit(planId, limitId) {
        await this.planLimitService.deleteLimit(planId, limitId);
        return api_response_1.ApiResponse.success(null, 'Plan limit deleted');
    }
};
exports.PlanLimitController = PlanLimitController;
__decorate([
    (0, common_1.Get)(':planId/limits'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all limits for a plan' }),
    __param(0, (0, common_1.Param)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlanLimitController.prototype, "getLimits", null);
__decorate([
    (0, common_1.Put)(':planId/limits'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk upsert plan limits' }),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_plan_limits_dto_1.UpsertPlanLimitsDto]),
    __metadata("design:returntype", Promise)
], PlanLimitController.prototype, "upsertLimits", null);
__decorate([
    (0, common_1.Delete)(':planId/limits/:limitId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a single plan limit' }),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Param)('limitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlanLimitController.prototype, "deleteLimit", null);
exports.PlanLimitController = PlanLimitController = __decorate([
    (0, swagger_1.ApiTags)('Plan Limits Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/plan-limits'),
    __metadata("design:paramtypes", [plan_limit_service_1.PlanLimitService])
], PlanLimitController);
//# sourceMappingURL=plan-limit.controller.js.map