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
exports.ControlRoomController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const control_room_service_1 = require("../services/control-room.service");
const rule_resolver_service_1 = require("../services/rule-resolver.service");
const control_room_dto_1 = require("./dto/control-room.dto");
let ControlRoomController = class ControlRoomController {
    constructor(controlRoomService, ruleResolver) {
        this.controlRoomService = controlRoomService;
        this.ruleResolver = ruleResolver;
    }
    async getRulesGrouped(tenantId) {
        const grouped = await this.controlRoomService.getRulesGrouped(tenantId);
        return api_response_1.ApiResponse.success(grouped, 'Rules retrieved');
    }
    async resolveAllRules(user) {
        const { tenantId, id: userId, roleIds = [], industryCode } = user;
        const rules = await this.ruleResolver.resolveAllRules(tenantId, userId, Array.isArray(roleIds) ? roleIds : [roleIds].filter(Boolean), industryCode);
        return api_response_1.ApiResponse.success(rules, 'All rules resolved');
    }
    async getCacheVersion(tenantId) {
        const result = await this.ruleResolver.getCacheVersion(tenantId);
        return api_response_1.ApiResponse.success(result, 'Cache version retrieved');
    }
    async resolveRule(user, ruleCode, pageCode) {
        const { tenantId, id: userId, roleIds = [], industryCode } = user;
        const resolved = await this.ruleResolver.resolveRule(tenantId, ruleCode, {
            userId,
            roleIds: Array.isArray(roleIds) ? roleIds : [roleIds].filter(Boolean),
            pageCode,
            industryCode,
        });
        if (!resolved) {
            return api_response_1.ApiResponse.error(`Rule '${ruleCode}' not found`);
        }
        return api_response_1.ApiResponse.success(resolved, 'Rule resolved');
    }
    async updateRule(user, ruleCode, dto, req) {
        const result = await this.controlRoomService.updateRule(user.tenantId, ruleCode, dto.value, dto.level, {
            userId: user.id,
            userName: user.name ?? user.email,
            ipAddress: req.ip,
            pageCode: dto.pageCode,
            roleId: dto.roleId,
            targetUserId: dto.userId,
            changeReason: dto.changeReason,
        });
        return api_response_1.ApiResponse.success(result, `Rule '${ruleCode}' updated`);
    }
    async resetRule(user, ruleCode, dto, req) {
        const result = await this.controlRoomService.resetRule(user.tenantId, ruleCode, dto.level, {
            userId: user.id,
            userName: user.name ?? user.email,
            ipAddress: req.ip,
            pageCode: dto.pageCode,
            roleId: dto.roleId,
            targetUserId: dto.userId,
            changeReason: dto.changeReason,
        });
        return api_response_1.ApiResponse.success(result, `Rule '${ruleCode}' reset at level '${dto.level}'`);
    }
    async getAuditTrail(tenantId, query) {
        const result = await this.controlRoomService.getAuditTrail(tenantId, undefined, {
            page: query.page ? parseInt(query.page, 10) : 1,
            limit: query.limit ? parseInt(query.limit, 10) : 50,
            level: query.level,
            changedByUserId: query.changedByUserId,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
        });
        return api_response_1.ApiResponse.success(result.data, 'Audit trail retrieved', result.meta);
    }
    async getAuditTrailForRule(tenantId, ruleCode, query) {
        const result = await this.controlRoomService.getAuditTrail(tenantId, ruleCode, {
            page: query.page ? parseInt(query.page, 10) : 1,
            limit: query.limit ? parseInt(query.limit, 10) : 50,
            level: query.level,
            changedByUserId: query.changedByUserId,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
        });
        return api_response_1.ApiResponse.success(result.data, 'Audit trail retrieved', result.meta);
    }
    async saveDraft(ruleCode, dto, user) {
        const result = await this.controlRoomService.saveDraft(user.tenantId, ruleCode, dto.value, dto.level || 'CONTROL_ROOM', { userId: user.id, userName: `${user.firstName} ${user.lastName}`, ipAddress: '' });
        return api_response_1.ApiResponse.success(result, 'Draft saved');
    }
    async getPendingDrafts(user) {
        const drafts = await this.controlRoomService.getPendingDrafts(user.tenantId);
        return api_response_1.ApiResponse.success(drafts);
    }
    async discardDraft(draftId, user) {
        await this.controlRoomService.discardDraft(user.tenantId, draftId);
        return api_response_1.ApiResponse.success({ discarded: true });
    }
    async discardAllDrafts(user) {
        await this.controlRoomService.discardAllDrafts(user.tenantId);
        return api_response_1.ApiResponse.success({ discarded: true });
    }
    async applyAllDrafts(body, user, req) {
        if (!body.changeReason?.trim()) {
            throw new common_1.BadRequestException('Change reason is required');
        }
        const result = await this.controlRoomService.applyAllDrafts(user.tenantId, {
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            changeReason: body.changeReason,
            ipAddress: req.ip,
        });
        return api_response_1.ApiResponse.success(result, `${result.appliedCount} changes applied`);
    }
};
exports.ControlRoomController = ControlRoomController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "getRulesGrouped", null);
__decorate([
    (0, common_1.Get)('resolve-all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "resolveAllRules", null);
__decorate([
    (0, common_1.Get)('cache-version'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "getCacheVersion", null);
__decorate([
    (0, common_1.Get)('resolve/:ruleCode'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('ruleCode')),
    __param(2, (0, common_1.Query)('pageCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "resolveRule", null);
__decorate([
    (0, common_1.Patch)('rules/:ruleCode'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('ruleCode')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, control_room_dto_1.UpdateRuleDto, Object]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)('rules/:ruleCode/reset'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('ruleCode')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, control_room_dto_1.ResetRuleDto, Object]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "resetRule", null);
__decorate([
    (0, common_1.Get)('audit'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, control_room_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "getAuditTrail", null);
__decorate([
    (0, common_1.Get)('audit/:ruleCode'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('ruleCode')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, control_room_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "getAuditTrailForRule", null);
__decorate([
    (0, common_1.Patch)('draft/:ruleCode'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('ruleCode')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, control_room_dto_1.UpdateRuleDto, Object]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Get)('drafts'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "getPendingDrafts", null);
__decorate([
    (0, common_1.Delete)('draft/:draftId'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('draftId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "discardDraft", null);
__decorate([
    (0, common_1.Delete)('drafts/all'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "discardAllDrafts", null);
__decorate([
    (0, common_1.Patch)('apply'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ControlRoomController.prototype, "applyAllDrafts", null);
exports.ControlRoomController = ControlRoomController = __decorate([
    (0, swagger_1.ApiTags)('Control Room'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('control-room'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [control_room_service_1.ControlRoomService,
        rule_resolver_service_1.RuleResolverService])
], ControlRoomController);
//# sourceMappingURL=control-room.controller.js.map