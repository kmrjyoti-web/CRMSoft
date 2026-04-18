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
exports.VendorErrorLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
const error_logger_service_1 = require("../../../../../common/errors/error-logger.service");
const error_catalog_service_1 = require("../../../../../common/errors/error-catalog.service");
const error_auto_report_service_1 = require("../../../../../common/errors/error-auto-report.service");
let VendorErrorLogsController = class VendorErrorLogsController {
    constructor(errorLoggerService, errorCatalogService, autoReportService) {
        this.errorLoggerService = errorLoggerService;
        this.errorCatalogService = errorCatalogService;
        this.autoReportService = autoReportService;
    }
    async list(page, limit, errorCode, tenantId, layer, severity, status, dateFrom, dateTo) {
        const result = await this.errorLoggerService.getRecent({
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
            errorCode,
            tenantId,
            layer,
            severity,
            status,
            dateFrom,
            dateTo,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async getTrends(tenantId, days) {
        const result = await this.errorLoggerService.getTrends({
            tenantId,
            days: days ? +days : undefined,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async getStats(tenantId, since) {
        const sinceDate = since ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const result = await this.errorLoggerService.getStats({ tenantId, since: sinceDate });
        return api_response_1.ApiResponse.success({
            total24h: result.total,
            bySeverity: result.bySeverity,
            byCode: result.byCode,
            errorRate: 0,
            trend: 0,
        });
    }
    async listAutoReportRules(tenantId) {
        const rules = await this.autoReportService.listRules(tenantId);
        return api_response_1.ApiResponse.success(rules);
    }
    async createAutoReportRule(body) {
        const rule = await this.autoReportService.createRule(body);
        return api_response_1.ApiResponse.success(rule);
    }
    async getByTraceId(traceId) {
        const result = await this.errorLoggerService.getByTraceId(traceId);
        return api_response_1.ApiResponse.success(result);
    }
    async getById(id) {
        const result = await this.errorLoggerService.getById(id);
        if (!result) {
            return api_response_1.ApiResponse.error('Error log not found');
        }
        return api_response_1.ApiResponse.success(result);
    }
    async resolve(id, body) {
        const result = await this.errorLoggerService.resolve(id, {
            resolvedById: body.resolvedById,
            resolution: body.resolution,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async assign(id, body) {
        const result = await this.errorLoggerService.assign(id, {
            assignedToId: body.assignedToId,
            assignedToName: body.assignedToName,
        });
        return api_response_1.ApiResponse.success(result);
    }
    async ignore(id) {
        const result = await this.errorLoggerService.ignore(id);
        return api_response_1.ApiResponse.success(result);
    }
    async updateAutoReportRule(ruleId, body) {
        const rule = await this.autoReportService.updateRule(ruleId, body);
        return api_response_1.ApiResponse.success(rule);
    }
    async deleteAutoReportRule(ruleId) {
        await this.autoReportService.deleteRule(ruleId);
        return api_response_1.ApiResponse.success({ deleted: true });
    }
};
exports.VendorErrorLogsController = VendorErrorLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List recent error logs with filtering' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('errorCode')),
    __param(3, (0, common_1.Query)('tenantId')),
    __param(4, (0, common_1.Query)('layer')),
    __param(5, (0, common_1.Query)('severity')),
    __param(6, (0, common_1.Query)('status')),
    __param(7, (0, common_1.Query)('dateFrom')),
    __param(8, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get error trends over time for charts' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "getTrends", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get error statistics for dashboard' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('auto-report-rules'),
    (0, swagger_1.ApiOperation)({ summary: 'List auto-report rules' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "listAutoReportRules", null);
__decorate([
    (0, common_1.Post)('auto-report-rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Create auto-report rule' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "createAutoReportRule", null);
__decorate([
    (0, common_1.Get)('trace/:traceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get error logs by trace/request ID' }),
    __param(0, (0, common_1.Param)('traceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "getByTraceId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single error log detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve an error log' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign an error log to a team member' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/ignore'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark an error log as ignored' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "ignore", null);
__decorate([
    (0, common_1.Patch)('auto-report-rules/:ruleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update auto-report rule' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "updateAutoReportRule", null);
__decorate([
    (0, common_1.Delete)('auto-report-rules/:ruleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete auto-report rule' }),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorErrorLogsController.prototype, "deleteAutoReportRule", null);
exports.VendorErrorLogsController = VendorErrorLogsController = __decorate([
    (0, swagger_1.ApiTags)('Error Logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('admin/error-logs'),
    __metadata("design:paramtypes", [error_logger_service_1.ErrorLoggerService,
        error_catalog_service_1.ErrorCatalogService,
        error_auto_report_service_1.ErrorAutoReportService])
], VendorErrorLogsController);
//# sourceMappingURL=vendor-error-logs.controller.js.map