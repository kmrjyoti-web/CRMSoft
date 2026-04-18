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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const audit_query_dto_1 = require("./dto/audit-query.dto");
const search_audit_dto_1 = require("./dto/search-audit.dto");
const retention_policy_dto_1 = require("./dto/retention-policy.dto");
const get_entity_timeline_query_1 = require("../application/queries/get-entity-timeline/get-entity-timeline.query");
const get_field_history_query_1 = require("../application/queries/get-field-history/get-field-history.query");
const get_global_feed_query_1 = require("../application/queries/get-global-feed/get-global-feed.query");
const get_user_activity_query_1 = require("../application/queries/get-user-activity/get-user-activity.query");
const get_audit_log_detail_query_1 = require("../application/queries/get-audit-log-detail/get-audit-log-detail.query");
const get_diff_view_query_1 = require("../application/queries/get-diff-view/get-diff-view.query");
const search_audit_logs_query_1 = require("../application/queries/search-audit-logs/search-audit-logs.query");
const get_audit_stats_query_1 = require("../application/queries/get-audit-stats/get-audit-stats.query");
const create_audit_log_command_1 = require("../application/commands/create-audit-log/create-audit-log.command");
const audit_export_service_1 = require("../services/audit-export.service");
const audit_skip_decorator_1 = require("../decorators/audit-skip.decorator");
let AuditController = class AuditController {
    constructor(commandBus, queryBus, exportService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.exportService = exportService;
    }
    async entityTimeline(entityType, entityId, q) {
        const result = await this.queryBus.execute(new get_entity_timeline_query_1.GetEntityTimelineQuery(entityType, entityId, q.page, q.limit, q.action, q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async fieldHistory(entityType, entityId, fieldName, q) {
        const result = await this.queryBus.execute(new get_field_history_query_1.GetFieldHistoryQuery(entityType, entityId, fieldName, q.page, q.limit));
        return api_response_1.ApiResponse.success(result);
    }
    async globalFeed(q) {
        const result = await this.queryBus.execute(new get_global_feed_query_1.GetGlobalFeedQuery(q.page, q.limit, q.entityType, q.action, q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async userActivity(userId, q) {
        const result = await this.queryBus.execute(new get_user_activity_query_1.GetUserActivityQuery(userId, q.page, q.limit, q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async search(q) {
        const result = await this.queryBus.execute(new search_audit_logs_query_1.SearchAuditLogsQuery(q.q, q.entityType, q.action, q.userId, q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined, q.field, q.module, q.sensitive, q.page, q.limit));
        return api_response_1.ApiResponse.success(result);
    }
    async stats(q) {
        const result = await this.queryBus.execute(new get_audit_stats_query_1.GetAuditStatsQuery(q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async userStats(userId, q) {
        const result = await this.queryBus.execute(new get_audit_stats_query_1.GetAuditStatsQuery(q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined, userId));
        return api_response_1.ApiResponse.success(result);
    }
    async detail(id) {
        const result = await this.queryBus.execute(new get_audit_log_detail_query_1.GetAuditLogDetailQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async diff(id) {
        const result = await this.queryBus.execute(new get_diff_view_query_1.GetDiffViewQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async exportAudit(dto, userId) {
        const result = await this.exportService.exportAuditTrail({
            format: dto.format,
            entityType: dto.entityType,
            entityId: dto.entityId,
            userId: dto.userId,
            dateFrom: new Date(dto.dateFrom),
            dateTo: new Date(dto.dateTo),
            exportedById: userId,
        });
        return api_response_1.ApiResponse.success(result, 'Audit trail exported');
    }
    async createLog(dto) {
        const result = await this.commandBus.execute(new create_audit_log_command_1.CreateAuditLogCommand(dto.entityType, dto.entityId, dto.action, dto.summary, dto.source, dto.performedById, dto.performedByName, dto.module, dto.changes, dto.correlationId, dto.tags));
        return api_response_1.ApiResponse.success(result, 'Audit log created');
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, audit_query_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "entityTimeline", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId/field/:fieldName'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Param)('fieldName')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, audit_query_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "fieldHistory", null);
__decorate([
    (0, common_1.Get)('feed'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_query_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "globalFeed", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, audit_query_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "userActivity", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_audit_dto_1.SearchAuditDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_query_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('stats/user/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, audit_query_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "userStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "detail", null);
__decorate([
    (0, common_1.Get)(':id/diff'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "diff", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [retention_policy_dto_1.ExportAuditDto, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "exportAudit", null);
__decorate([
    (0, common_1.Post)('log'),
    (0, require_permissions_decorator_1.RequirePermissions)('audit:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [retention_policy_dto_1.CreateAuditLogDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "createLog", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, audit_skip_decorator_1.AuditSkip)(),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        audit_export_service_1.AuditExportService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map