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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const subscribe_command_1 = require("../application/commands/subscribe/subscribe.command");
const change_plan_command_1 = require("../application/commands/change-plan/change-plan.command");
const cancel_subscription_command_1 = require("../application/commands/cancel-subscription/cancel-subscription.command");
const complete_onboarding_step_command_1 = require("../application/commands/complete-onboarding-step/complete-onboarding-step.command");
const query_1 = require("../application/queries/get-subscription/query");
const query_2 = require("../application/queries/get-tenant-usage/query");
const query_3 = require("../application/queries/list-plans/query");
const subscribe_dto_1 = require("./dto/subscribe.dto");
const change_plan_dto_1 = require("./dto/change-plan.dto");
const upsert_tenant_profile_dto_1 = require("./dto/upsert-tenant-profile.dto");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../../../common/decorators/roles.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const limit_checker_service_1 = require("../services/limit-checker.service");
const usage_tracker_service_1 = require("../services/usage-tracker.service");
const tenant_profile_service_1 = require("../services/tenant-profile.service");
let SubscriptionController = class SubscriptionController {
    constructor(commandBus, queryBus, limitChecker, usageTracker, tenantProfileService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.limitChecker = limitChecker;
        this.usageTracker = usageTracker;
        this.tenantProfileService = tenantProfileService;
    }
    async getCurrent(tenantId) {
        const subscription = await this.queryBus.execute(new query_1.GetSubscriptionQuery(tenantId));
        return api_response_1.ApiResponse.success(subscription);
    }
    async subscribe(dto, tenantId) {
        const result = await this.commandBus.execute(new subscribe_command_1.SubscribeCommand(tenantId, dto.planId));
        return api_response_1.ApiResponse.success(result, 'Subscribed successfully');
    }
    async changePlan(dto, tenantId) {
        const result = await this.commandBus.execute(new change_plan_command_1.ChangePlanCommand(tenantId, dto.newPlanId));
        return api_response_1.ApiResponse.success(result, 'Plan changed successfully');
    }
    async cancel(tenantId) {
        const subscription = await this.queryBus.execute(new query_1.GetSubscriptionQuery(tenantId));
        const result = await this.commandBus.execute(new cancel_subscription_command_1.CancelSubscriptionCommand(subscription.id, tenantId));
        return api_response_1.ApiResponse.success(result, 'Subscription cancelled');
    }
    async getUsage(tenantId) {
        const usage = await this.queryBus.execute(new query_2.GetTenantUsageQuery(tenantId));
        return api_response_1.ApiResponse.success(usage);
    }
    async completeOnboardingStep(step, tenantId) {
        const result = await this.commandBus.execute(new complete_onboarding_step_command_1.CompleteOnboardingStepCommand(tenantId, step));
        return api_response_1.ApiResponse.success(result, 'Onboarding step completed');
    }
    async getLimitsWithUsage(tenantId) {
        const result = await this.limitChecker.getAllLimitsWithUsage(tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async getUsageDetail(tenantId) {
        const details = await this.usageTracker.getUsageDetails(tenantId);
        return api_response_1.ApiResponse.success(details);
    }
    async updateProfile(tenantId, body) {
        const profile = await this.tenantProfileService.upsert(tenantId, body);
        return api_response_1.ApiResponse.success(profile, 'Profile updated');
    }
    async listPlans() {
        const plans = await this.queryBus.execute(new query_3.ListPlansQuery(true));
        return api_response_1.ApiResponse.success(plans);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current subscription details' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe to a plan' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscribe_dto_1.SubscribeDto, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('change-plan'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Change current subscription plan' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_plan_dto_1.ChangePlanDto, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "changePlan", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel current subscription' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current tenant usage statistics' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUsage", null);
__decorate([
    (0, common_1.Post)('onboarding/:step'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Complete an onboarding step' }),
    __param(0, (0, common_1.Param)('step')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "completeOnboardingStep", null);
__decorate([
    (0, common_1.Get)('limits'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current plan limits with usage' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getLimitsWithUsage", null);
__decorate([
    (0, common_1.Get)('usage-detail'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed usage breakdown per resource' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUsageDetail", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update own tenant profile (for onboarding)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_tenant_profile_dto_1.UpsertTenantProfileDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('plans'),
    (0, roles_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'List available plans (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "listPlans", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, swagger_1.ApiTags)('Subscription'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tenant/subscription'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        limit_checker_service_1.LimitCheckerService,
        usage_tracker_service_1.UsageTrackerService,
        tenant_profile_service_1.TenantProfileService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map