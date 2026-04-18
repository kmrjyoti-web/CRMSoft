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
exports.DbMaintenanceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const db_maintenance_service_1 = require("../db-maintenance.service");
let DbMaintenanceController = class DbMaintenanceController {
    constructor(maintenance) {
        this.maintenance = maintenance;
    }
    async summary() {
        const data = await this.maintenance.getDatabaseSummary();
        return api_response_1.ApiResponse.success(data);
    }
    async tableStats(dbUrl) {
        const data = await this.maintenance.getTableStats(dbUrl);
        return api_response_1.ApiResponse.success(data);
    }
    async indexStats(dbUrl) {
        const data = await this.maintenance.getIndexStats(dbUrl);
        return api_response_1.ApiResponse.success(data);
    }
    async bloatAnalysis(dbUrl) {
        const data = await this.maintenance.getBloatAnalysis(dbUrl);
        return api_response_1.ApiResponse.success(data);
    }
    async slowQueries(limit, dbUrl) {
        const data = await this.maintenance.getSlowQueries(dbUrl, limit ? Number(limit) : 20);
        return api_response_1.ApiResponse.success(data);
    }
    async connections(dbUrl) {
        const data = await this.maintenance.getConnectionPool(dbUrl);
        return api_response_1.ApiResponse.success(data);
    }
    async vacuum(body) {
        const result = await this.maintenance.runVacuum(body.tableName, body.full, body.dbUrl);
        return api_response_1.ApiResponse.success(result, result.success ? 'VACUUM completed' : 'VACUUM failed');
    }
    async analyze(body) {
        const result = await this.maintenance.runAnalyze(body.tableName, body.dbUrl);
        return api_response_1.ApiResponse.success(result, result.success ? 'ANALYZE completed' : 'ANALYZE failed');
    }
    async reindex(body) {
        const result = await this.maintenance.runReindex(body.indexName, body.dbUrl);
        return api_response_1.ApiResponse.success(result, result.success ? 'REINDEX completed' : 'REINDEX failed');
    }
    async cleanupDevLogs() {
        const result = await this.maintenance.cleanupDevLogs();
        return api_response_1.ApiResponse.success(result, `Deleted ${result.deleted} dev log entries`);
    }
    async cleanupErrorLogs() {
        const result = await this.maintenance.cleanupErrorLogs();
        return api_response_1.ApiResponse.success(result, `Deleted ${result.deleted} error log entries`);
    }
    async cleanupAuditLogs() {
        const result = await this.maintenance.cleanupAuditLogs();
        return api_response_1.ApiResponse.success(result, `Deleted ${result.deleted} audit log entries`);
    }
    async cleanupAll() {
        const results = await this.maintenance.runAllCleanup();
        const total = results.reduce((s, r) => s + r.deleted, 0);
        return api_response_1.ApiResponse.success(results, `Cleanup complete — ${total} records deleted`);
    }
};
exports.DbMaintenanceController = DbMaintenanceController;
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('tables'),
    __param(0, (0, common_1.Query)('dbUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "tableStats", null);
__decorate([
    (0, common_1.Get)('indexes'),
    __param(0, (0, common_1.Query)('dbUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "indexStats", null);
__decorate([
    (0, common_1.Get)('bloat'),
    __param(0, (0, common_1.Query)('dbUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "bloatAnalysis", null);
__decorate([
    (0, common_1.Get)('slow-queries'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('dbUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "slowQueries", null);
__decorate([
    (0, common_1.Get)('connections'),
    __param(0, (0, common_1.Query)('dbUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "connections", null);
__decorate([
    (0, common_1.Post)('vacuum'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "vacuum", null);
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "analyze", null);
__decorate([
    (0, common_1.Post)('reindex'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "reindex", null);
__decorate([
    (0, common_1.Post)('cleanup/dev-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "cleanupDevLogs", null);
__decorate([
    (0, common_1.Post)('cleanup/error-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "cleanupErrorLogs", null);
__decorate([
    (0, common_1.Post)('cleanup/audit-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "cleanupAuditLogs", null);
__decorate([
    (0, common_1.Post)('cleanup/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DbMaintenanceController.prototype, "cleanupAll", null);
exports.DbMaintenanceController = DbMaintenanceController = __decorate([
    (0, common_1.Controller)('ops/db-maintenance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __metadata("design:paramtypes", [db_maintenance_service_1.DbMaintenanceService])
], DbMaintenanceController);
//# sourceMappingURL=db-maintenance.controller.js.map