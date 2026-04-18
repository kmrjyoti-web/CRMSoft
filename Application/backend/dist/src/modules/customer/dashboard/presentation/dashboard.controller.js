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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const dashboard_query_dto_1 = require("./dto/dashboard-query.dto");
const get_executive_dashboard_query_1 = require("../application/queries/get-executive-dashboard/get-executive-dashboard.query");
const get_sales_pipeline_query_1 = require("../application/queries/get-sales-pipeline/get-sales-pipeline.query");
const get_sales_funnel_query_1 = require("../application/queries/get-sales-funnel/get-sales-funnel.query");
const get_my_dashboard_query_1 = require("../application/queries/get-my-dashboard/get-my-dashboard.query");
let DashboardController = class DashboardController {
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async executive(q) {
        const result = await this.queryBus.execute(new get_executive_dashboard_query_1.GetExecutiveDashboardQuery(new Date(q.dateFrom), new Date(q.dateTo), q.userId));
        return api_response_1.ApiResponse.success(result);
    }
    async pipeline(q) {
        const result = await this.queryBus.execute(new get_sales_pipeline_query_1.GetSalesPipelineQuery(q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined, q.userId));
        return api_response_1.ApiResponse.success(result);
    }
    async funnel(q) {
        const result = await this.queryBus.execute(new get_sales_funnel_query_1.GetSalesFunnelQuery(new Date(q.dateFrom), new Date(q.dateTo), q.userId));
        return api_response_1.ApiResponse.success(result);
    }
    async myDashboard(userId) {
        const result = await this.queryBus.execute(new get_my_dashboard_query_1.GetMyDashboardQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('executive'),
    (0, require_permissions_decorator_1.RequirePermissions)('dashboard:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "executive", null);
__decorate([
    (0, common_1.Get)('pipeline'),
    (0, require_permissions_decorator_1.RequirePermissions)('dashboard:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "pipeline", null);
__decorate([
    (0, common_1.Get)('funnel'),
    (0, require_permissions_decorator_1.RequirePermissions)('dashboard:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_query_dto_1.DashboardQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "funnel", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, require_permissions_decorator_1.RequirePermissions)('dashboard:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "myDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map