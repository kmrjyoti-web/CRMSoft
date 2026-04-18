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
exports.VendorTenantAuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
const tenant_audit_service_1 = require("../services/tenant-audit.service");
let VendorTenantAuditController = class VendorTenantAuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async startAudit(tenantId, body, req) {
        const result = await this.auditService.startAudit(tenantId, req.user.id, req.user.name || req.user.email, body.reason, body.scheduledDays);
        return api_response_1.ApiResponse.success(result);
    }
    async stopAudit(tenantId) {
        const result = await this.auditService.stopAudit(tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async getAuditStatus(tenantId) {
        const result = await this.auditService.getAuditStatus(tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async getAuditLogs(tenantId, page, limit, userId, actionType, entityType) {
        const session = await this.auditService.getAuditStatus(tenantId);
        if (!session) {
            return api_response_1.ApiResponse.success({
                data: [],
                meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
            });
        }
        const result = await this.auditService.getAuditLogs(session.id, {
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
            userId,
            actionType,
            entityType,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async getAuditReport(tenantId) {
        const session = await this.auditService.getLatestSession(tenantId);
        if (!session)
            return api_response_1.ApiResponse.success(null);
        const result = await this.auditService.getAuditReport(session.id);
        return api_response_1.ApiResponse.success(result);
    }
    async getAuditHistory(tenantId) {
        const result = await this.auditService.getAuditHistory(tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async getAllActiveAudits() {
        const result = await this.auditService.getAllActiveAudits();
        return api_response_1.ApiResponse.success(result);
    }
};
exports.VendorTenantAuditController = VendorTenantAuditController;
__decorate([
    (0, common_1.Post)('tenants/:tenantId/audit/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start audit session on a tenant' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VendorTenantAuditController.prototype, "startAudit", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/audit/stop'),
    (0, swagger_1.ApiOperation)({ summary: 'Stop active audit session' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorTenantAuditController.prototype, "stopAudit", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/audit'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current audit status and stats' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorTenantAuditController.prototype, "getAuditStatus", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/audit/logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit activity logs (paginated)' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('actionType')),
    __param(5, (0, common_1.Query)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorTenantAuditController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/audit/report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate audit summary report' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorTenantAuditController.prototype, "getAuditReport", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/audit/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get past audit sessions' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorTenantAuditController.prototype, "getAuditHistory", null);
__decorate([
    (0, common_1.Get)('audits'),
    (0, swagger_1.ApiOperation)({ summary: 'List all active audits across tenants' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorTenantAuditController.prototype, "getAllActiveAudits", null);
exports.VendorTenantAuditController = VendorTenantAuditController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Tenant Audit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor'),
    __metadata("design:paramtypes", [tenant_audit_service_1.TenantAuditService])
], VendorTenantAuditController);
//# sourceMappingURL=vendor-tenant-audit.controller.js.map