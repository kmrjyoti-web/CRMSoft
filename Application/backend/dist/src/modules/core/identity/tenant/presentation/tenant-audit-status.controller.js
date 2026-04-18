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
exports.TenantAuditStatusController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
const tenant_audit_service_1 = require("../services/tenant-audit.service");
let TenantAuditStatusController = class TenantAuditStatusController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getAuditStatus(req) {
        const tenantId = req.user?.tenantId;
        if (!tenantId)
            return api_response_1.ApiResponse.success(null);
        const session = await this.auditService.getAuditStatus(tenantId);
        if (!session)
            return api_response_1.ApiResponse.success(null);
        return api_response_1.ApiResponse.success({
            isUnderAudit: true,
            reason: session.reason,
            startedAt: session.startedAt,
            startedByName: session.startedByName,
        });
    }
};
exports.TenantAuditStatusController = TenantAuditStatusController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if current tenant is under audit' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAuditStatusController.prototype, "getAuditStatus", null);
exports.TenantAuditStatusController = TenantAuditStatusController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Audit Status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tenant/audit-status'),
    __metadata("design:paramtypes", [tenant_audit_service_1.TenantAuditService])
], TenantAuditStatusController);
//# sourceMappingURL=tenant-audit-status.controller.js.map