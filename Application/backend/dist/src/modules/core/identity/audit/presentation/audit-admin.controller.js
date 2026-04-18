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
exports.AuditAdminController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const retention_policy_dto_1 = require("./dto/retention-policy.dto");
const get_retention_policies_query_1 = require("../application/queries/get-retention-policies/get-retention-policies.query");
const update_retention_policy_command_1 = require("../application/commands/update-retention-policy/update-retention-policy.command");
const cleanup_old_logs_command_1 = require("../application/commands/cleanup-old-logs/cleanup-old-logs.command");
const audit_cleanup_service_1 = require("../services/audit-cleanup.service");
const audit_skip_decorator_1 = require("../decorators/audit-skip.decorator");
let AuditAdminController = class AuditAdminController {
    constructor(commandBus, queryBus, cleanupService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.cleanupService = cleanupService;
    }
    async listPolicies() {
        const result = await this.queryBus.execute(new get_retention_policies_query_1.GetRetentionPoliciesQuery());
        return api_response_1.ApiResponse.success(result);
    }
    async updatePolicy(entityType, dto) {
        const result = await this.commandBus.execute(new update_retention_policy_command_1.UpdateRetentionPolicyCommand(entityType, dto.retentionDays, dto.archiveEnabled, dto.isActive));
        return api_response_1.ApiResponse.success(result, 'Retention policy updated');
    }
    async cleanup() {
        const result = await this.commandBus.execute(new cleanup_old_logs_command_1.CleanupOldLogsCommand());
        return api_response_1.ApiResponse.success(result, 'Cleanup completed');
    }
    async cleanupPreview() {
        const result = await this.cleanupService.getCleanupPreview();
        return api_response_1.ApiResponse.success(result);
    }
};
exports.AuditAdminController = AuditAdminController;
__decorate([
    (0, common_1.Get)('retention-policies'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditAdminController.prototype, "listPolicies", null);
__decorate([
    (0, common_1.Put)('retention-policies/:entityType'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:admin'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, retention_policy_dto_1.UpdateRetentionPolicyDto]),
    __metadata("design:returntype", Promise)
], AuditAdminController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditAdminController.prototype, "cleanup", null);
__decorate([
    (0, common_1.Get)('cleanup-preview'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditAdminController.prototype, "cleanupPreview", null);
exports.AuditAdminController = AuditAdminController = __decorate([
    (0, common_1.Controller)('admin/audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, audit_skip_decorator_1.AuditSkip)(),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        audit_cleanup_service_1.AuditCleanupService])
], AuditAdminController);
//# sourceMappingURL=audit-admin.controller.js.map