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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const dashboard_query_dto_1 = require("./dto/dashboard-query.dto");
const get_activity_heatmap_query_1 = require("../application/queries/get-activity-heatmap/get-activity-heatmap.query");
const get_revenue_analytics_query_1 = require("../application/queries/get-revenue-analytics/get-revenue-analytics.query");
const get_lead_source_analysis_query_1 = require("../application/queries/get-lead-source-analysis/get-lead-source-analysis.query");
const get_lost_reason_analysis_query_1 = require("../application/queries/get-lost-reason-analysis/get-lost-reason-analysis.query");
const get_aging_analysis_query_1 = require("../application/queries/get-aging-analysis/get-aging-analysis.query");
const get_velocity_metrics_query_1 = require("../application/queries/get-velocity-metrics/get-velocity-metrics.query");
let AnalyticsController = class AnalyticsController {
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async heatmap(q) {
        const result = await this.queryBus.execute(new get_activity_heatmap_query_1.GetActivityHeatmapQuery(new Date(q.dateFrom), new Date(q.dateTo), q.userId, q.activityType));
        return api_response_1.ApiResponse.success(result);
    }
    async revenue(q) {
        const result = await this.queryBus.execute(new get_revenue_analytics_query_1.GetRevenueAnalyticsQuery(new Date(q.dateFrom), new Date(q.dateTo), q.groupBy));
        return api_response_1.ApiResponse.success(result);
    }
    async leadSources(q) {
        const result = await this.queryBus.execute(new get_lead_source_analysis_query_1.GetLeadSourceAnalysisQuery(new Date(q.dateFrom), new Date(q.dateTo)));
        return api_response_1.ApiResponse.success(result);
    }
    async lostReasons(q) {
        const result = await this.queryBus.execute(new get_lost_reason_analysis_query_1.GetLostReasonAnalysisQuery(new Date(q.dateFrom), new Date(q.dateTo)));
        return api_response_1.ApiResponse.success(result);
    }
    async aging(q) {
        const result = await this.queryBus.execute(new get_aging_analysis_query_1.GetAgingAnalysisQuery(q.userId));
        return api_response_1.ApiResponse.success(result);
    }
    async velocity(q) {
        const result = await this.queryBus.execute(new get_velocity_metrics_query_1.GetVelocityMetricsQuery(new Date(q.dateFrom), new Date(q.dateTo)));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('activity-heatmap'),
    (0, require_permissions_decorator_1.RequirePermissions)('analytics:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "heatmap", null);
__decorate([
    (0, common_1.Get)('revenue'),
    (0, require_permissions_decorator_1.RequirePermissions)('analytics:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "revenue", null);
__decorate([
    (0, common_1.Get)('lead-sources'),
    (0, require_permissions_decorator_1.RequirePermissions)('analytics:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "leadSources", null);
__decorate([
    (0, common_1.Get)('lost-reasons'),
    (0, require_permissions_decorator_1.RequirePermissions)('analytics:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "lostReasons", null);
__decorate([
    (0, common_1.Get)('aging'),
    (0, require_permissions_decorator_1.RequirePermissions)('analytics:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "aging", null);
__decorate([
    (0, common_1.Get)('velocity'),
    (0, require_permissions_decorator_1.RequirePermissions)('analytics:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "velocity", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map