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
exports.ApprovalRulesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const approval_rule_dto_1 = require("./dto/approval-rule.dto");
let ApprovalRulesController = class ApprovalRulesController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const rule = await this.prisma.working.approvalRule.create({
            data: {
                entityType: dto.entityType,
                action: dto.action,
                checkerRole: dto.checkerRole,
                minCheckers: dto.minCheckers ?? 1,
                skipForRoles: dto.skipForRoles ?? [],
                amountField: dto.amountField,
                amountThreshold: dto.amountThreshold,
                expiryHours: dto.expiryHours ?? 48,
            },
        });
        return api_response_1.ApiResponse.success(rule, 'Approval rule created');
    }
    async list() {
        const rules = await this.prisma.working.approvalRule.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return api_response_1.ApiResponse.success(rules);
    }
    async update(id, dto) {
        const rule = await this.prisma.working.approvalRule.update({
            where: { id },
            data: dto,
        });
        return api_response_1.ApiResponse.success(rule, 'Approval rule updated');
    }
    async remove(id) {
        await this.prisma.working.approvalRule.delete({ where: { id } });
        return api_response_1.ApiResponse.success(null, 'Approval rule deleted');
    }
};
exports.ApprovalRulesController = ApprovalRulesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [approval_rule_dto_1.CreateApprovalRuleDto]),
    __metadata("design:returntype", Promise)
], ApprovalRulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApprovalRulesController.prototype, "list", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approval_rule_dto_1.UpdateApprovalRuleDto]),
    __metadata("design:returntype", Promise)
], ApprovalRulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalRulesController.prototype, "remove", null);
exports.ApprovalRulesController = ApprovalRulesController = __decorate([
    (0, common_1.Controller)('approval-rules'),
    (0, require_permissions_decorator_1.RequirePermissions)('permissions:manage'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalRulesController);
//# sourceMappingURL=approval-rules.controller.js.map