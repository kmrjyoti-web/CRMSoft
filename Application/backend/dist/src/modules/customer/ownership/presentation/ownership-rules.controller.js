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
exports.OwnershipRulesController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const passport_1 = require("@nestjs/passport");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const create_assignment_rule_command_1 = require("../application/commands/create-assignment-rule/create-assignment-rule.command");
const update_assignment_rule_command_1 = require("../application/commands/update-assignment-rule/update-assignment-rule.command");
const delete_assignment_rule_command_1 = require("../application/commands/delete-assignment-rule/delete-assignment-rule.command");
const auto_assign_command_1 = require("../application/commands/auto-assign/auto-assign.command");
const get_assignment_rules_query_1 = require("../application/queries/get-assignment-rules/get-assignment-rules.query");
const create_rule_dto_1 = require("./dto/create-rule.dto");
const auto_assign_dto_1 = require("./dto/auto-assign.dto");
const rule_engine_service_1 = require("../services/rule-engine.service");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let OwnershipRulesController = class OwnershipRulesController {
    constructor(commandBus, queryBus, ruleEngine, prisma) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.ruleEngine = ruleEngine;
        this.prisma = prisma;
    }
    async createRule(dto, userId) {
        const result = await this.commandBus.execute(new create_assignment_rule_command_1.CreateAssignmentRuleCommand(dto.name, dto.entityType, dto.triggerEvent, dto.conditions, dto.assignmentMethod, userId, dto.description, dto.assignToUserId, dto.assignToTeamIds, dto.assignToRoleId, dto.ownerType, dto.priority, dto.maxPerUser, dto.respectWorkload, dto.escalateAfterHours, dto.escalateToUserId, dto.escalateToRoleId));
        return api_response_1.ApiResponse.success(result, 'Assignment rule created');
    }
    async listRules(query) {
        const result = await this.queryBus.execute(new get_assignment_rules_query_1.GetAssignmentRulesQuery(query.entityType, query.status, query.page, query.limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getRule(id) {
        const rule = await this.prisma.working.assignmentRule.findUnique({ where: { id } });
        return api_response_1.ApiResponse.success(rule);
    }
    async updateRule(id, dto) {
        const result = await this.commandBus.execute(new update_assignment_rule_command_1.UpdateAssignmentRuleCommand(id, dto));
        return api_response_1.ApiResponse.success(result, 'Assignment rule updated');
    }
    async deleteRule(id) {
        await this.commandBus.execute(new delete_assignment_rule_command_1.DeleteAssignmentRuleCommand(id));
        return api_response_1.ApiResponse.success(null, 'Assignment rule deactivated');
    }
    async testRule(id, dto) {
        const result = await this.ruleEngine.testRule(id, dto.entityType, dto.entityId);
        return api_response_1.ApiResponse.success(result);
    }
    async autoAssign(dto, userId) {
        const result = await this.commandBus.execute(new auto_assign_command_1.AutoAssignCommand(dto.entityType, dto.entityId, dto.triggerEvent, userId));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.OwnershipRulesController = OwnershipRulesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rule_dto_1.CreateRuleDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipRulesController.prototype, "createRule", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OwnershipRulesController.prototype, "listRules", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OwnershipRulesController.prototype, "getRule", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OwnershipRulesController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OwnershipRulesController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Post)(':id/test'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OwnershipRulesController.prototype, "testRule", null);
__decorate([
    (0, common_1.Post)('/auto-assign'),
    (0, require_permissions_decorator_1.RequirePermissions)('ownership:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auto_assign_dto_1.AutoAssignDto, String]),
    __metadata("design:returntype", Promise)
], OwnershipRulesController.prototype, "autoAssign", null);
exports.OwnershipRulesController = OwnershipRulesController = __decorate([
    (0, common_1.Controller)('ownership/rules'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        rule_engine_service_1.RuleEngineService,
        prisma_service_1.PrismaService])
], OwnershipRulesController);
//# sourceMappingURL=ownership-rules.controller.js.map