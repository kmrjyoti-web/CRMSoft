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
exports.ErrorAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../decorators/current-user.decorator");
const error_catalog_service_1 = require("../error-catalog.service");
const error_logger_service_1 = require("../error-logger.service");
const error_auto_report_service_1 = require("../error-auto-report.service");
const error_codes_1 = require("../error-codes");
const error_docs_generator_1 = require("../error-docs-generator");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let ErrorAdminController = class ErrorAdminController {
    constructor(catalogService, loggerService, autoReportService, prisma) {
        this.catalogService = catalogService;
        this.loggerService = loggerService;
        this.autoReportService = autoReportService;
        this.prisma = prisma;
    }
    async listCatalog(module, layer) {
        if (module)
            return this.catalogService.getByModule(module);
        if (layer)
            return this.catalogService.getByLayer(layer);
        return this.catalogService.getAll();
    }
    async getCatalogEntry(code) {
        const entry = await this.catalogService.getByCode(code);
        if (!entry)
            return { found: false, code };
        return { found: true, ...entry };
    }
    async refreshCatalog() {
        const count = await this.catalogService.refreshCache();
        return { refreshed: true, entries: count };
    }
    async updateCatalogEntry(code, body) {
        const updated = await this.prisma.errorCatalog.update({
            where: { code },
            data: body,
        });
        await this.catalogService.refreshCache();
        return updated;
    }
    async getModules() {
        const result = await this.prisma.errorCatalog.findMany({
            select: { module: true },
            distinct: ['module'],
        });
        return result.map((r) => r.module);
    }
    async getLogsBySeverity(severity, tenantId, limit = '50') {
        if (!tenantId)
            return [];
        return this.loggerService.getBySeverity(tenantId, severity, parseInt(limit));
    }
    listErrorCodes() {
        const codes = Object.values(error_codes_1.ERROR_CODES).map((def) => ({
            code: def.code,
            httpStatus: def.httpStatus,
            message: def.message,
            suggestion: def.suggestion,
        }));
        return { total: error_codes_1.TOTAL_ERROR_CODES, codes };
    }
    getErrorCode(code) {
        const def = error_codes_1.ERROR_CODES[code];
        if (!def)
            return { found: false, code };
        return { found: true, ...def };
    }
    getErrorDocs() {
        return { markdown: (0, error_docs_generator_1.generateErrorReference)() };
    }
    async listErrorLogs(page, limit, errorCode, tenantId, layer, severity) {
        return this.loggerService.getRecent({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            errorCode,
            tenantId,
            layer,
            severity,
        });
    }
    async getErrorStats(tenantId, since) {
        return this.loggerService.getStats({ tenantId, since });
    }
    async getByTraceId(traceId) {
        const logs = await this.loggerService.getByTraceId(traceId);
        return { traceId, count: logs.length, logs };
    }
    async reportToProvider(id, userId) {
        const result = await this.autoReportService.reportToProvider(id, userId);
        return {
            success: result.reported,
            message: result.reported
                ? 'Error reported to software provider successfully.'
                : 'Error log not found.',
        };
    }
    logFrontendError(body) {
        this.loggerService.log({
            requestId: `fe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            errorCode: body.errorCode || 'FE_UNKNOWN',
            message: body.message,
            statusCode: 0,
            path: body.path || '/',
            method: 'FRONTEND',
            layer: 'FE',
            severity: 'ERROR',
            userId: body.userId,
            tenantId: body.tenantId,
            details: body.details ? error_logger_service_1.ErrorLoggerService.sanitizeBody(body.details) : undefined,
            userAgent: body.userAgent,
        });
        return { logged: true };
    }
};
exports.ErrorAdminController = ErrorAdminController;
__decorate([
    (0, common_1.Get)('catalog'),
    __param(0, (0, common_1.Query)('module')),
    __param(1, (0, common_1.Query)('layer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "listCatalog", null);
__decorate([
    (0, common_1.Get)('catalog/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "getCatalogEntry", null);
__decorate([
    (0, common_1.Post)('catalog/refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "refreshCatalog", null);
__decorate([
    (0, common_1.Put)('catalog/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "updateCatalogEntry", null);
__decorate([
    (0, common_1.Get)('modules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "getModules", null);
__decorate([
    (0, common_1.Get)('logs/severity/:severity'),
    __param(0, (0, common_1.Param)('severity')),
    __param(1, (0, common_1.Query)('tenantId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "getLogsBySeverity", null);
__decorate([
    (0, common_1.Get)('codes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ErrorAdminController.prototype, "listErrorCodes", null);
__decorate([
    (0, common_1.Get)('codes/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ErrorAdminController.prototype, "getErrorCode", null);
__decorate([
    (0, common_1.Get)('docs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ErrorAdminController.prototype, "getErrorDocs", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('errorCode')),
    __param(3, (0, common_1.Query)('tenantId')),
    __param(4, (0, common_1.Query)('layer')),
    __param(5, (0, common_1.Query)('severity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "listErrorLogs", null);
__decorate([
    (0, common_1.Get)('logs/stats'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "getErrorStats", null);
__decorate([
    (0, common_1.Get)('trace/:traceId'),
    __param(0, (0, common_1.Param)('traceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "getByTraceId", null);
__decorate([
    (0, common_1.Post)('logs/:id/report-to-provider'),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ErrorAdminController.prototype, "reportToProvider", null);
__decorate([
    (0, common_1.Post)('frontend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ErrorAdminController.prototype, "logFrontendError", null);
exports.ErrorAdminController = ErrorAdminController = __decorate([
    (0, common_1.Controller)('admin/errors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [error_catalog_service_1.ErrorCatalogService,
        error_logger_service_1.ErrorLoggerService,
        error_auto_report_service_1.ErrorAutoReportService,
        prisma_service_1.PrismaService])
], ErrorAdminController);
//# sourceMappingURL=error-admin.controller.js.map