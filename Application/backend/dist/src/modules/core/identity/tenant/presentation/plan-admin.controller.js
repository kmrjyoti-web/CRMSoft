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
exports.PlanAdminController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const super_admin_guard_1 = require("../infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../infrastructure/decorators/super-admin-route.decorator");
const create_plan_command_1 = require("../application/commands/create-plan/create-plan.command");
const update_plan_command_1 = require("../application/commands/update-plan/update-plan.command");
const deactivate_plan_command_1 = require("../application/commands/deactivate-plan/deactivate-plan.command");
const query_1 = require("../application/queries/list-plans/query");
const query_2 = require("../application/queries/get-plan-by-id/query");
const create_plan_dto_1 = require("./dto/create-plan.dto");
const update_plan_dto_1 = require("./dto/update-plan.dto");
const plan_query_dto_1 = require("./dto/plan-query.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let PlanAdminController = class PlanAdminController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto) {
        const planId = await this.commandBus.execute(new create_plan_command_1.CreatePlanCommand(dto.name, dto.code, dto.interval, dto.price, dto.maxUsers, dto.maxContacts, dto.maxLeads, dto.maxProducts, dto.maxStorage, dto.features ?? [], dto.description, dto.currency, dto.isActive, dto.sortOrder));
        const plan = await this.queryBus.execute(new query_2.GetPlanByIdQuery(planId));
        return api_response_1.ApiResponse.success(plan, 'Plan created');
    }
    async findAll(query) {
        const result = await this.queryBus.execute(new query_1.ListPlansQuery(query.isActive));
        return api_response_1.ApiResponse.success(result);
    }
    async findById(id) {
        const plan = await this.queryBus.execute(new query_2.GetPlanByIdQuery(id));
        return api_response_1.ApiResponse.success(plan);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_plan_command_1.UpdatePlanCommand(id, dto.name, dto.description, dto.price, dto.maxUsers, dto.maxContacts, dto.maxLeads, dto.maxProducts, dto.maxStorage, dto.features, dto.isActive, dto.sortOrder));
        const plan = await this.queryBus.execute(new query_2.GetPlanByIdQuery(id));
        return api_response_1.ApiResponse.success(plan, 'Plan updated');
    }
    async deactivate(id) {
        await this.commandBus.execute(new deactivate_plan_command_1.DeactivatePlanCommand(id));
        const plan = await this.queryBus.execute(new query_2.GetPlanByIdQuery(id));
        return api_response_1.ApiResponse.success(plan, 'Plan deactivated');
    }
};
exports.PlanAdminController = PlanAdminController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subscription plan' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_plan_dto_1.CreatePlanDto]),
    __metadata("design:returntype", Promise)
], PlanAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all subscription plans' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [plan_query_dto_1.PlanQueryDto]),
    __metadata("design:returntype", Promise)
], PlanAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get plan by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlanAdminController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update plan details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_plan_dto_1.UpdatePlanDto]),
    __metadata("design:returntype", Promise)
], PlanAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a plan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlanAdminController.prototype, "deactivate", null);
exports.PlanAdminController = PlanAdminController = __decorate([
    (0, swagger_1.ApiTags)('Plan Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/plans'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], PlanAdminController);
//# sourceMappingURL=plan-admin.controller.js.map