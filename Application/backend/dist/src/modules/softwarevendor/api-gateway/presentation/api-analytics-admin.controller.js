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
exports.ApiAnalyticsAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const api_analytics_service_1 = require("../services/api-analytics.service");
let ApiAnalyticsAdminController = class ApiAnalyticsAdminController {
    constructor(analytics) {
        this.analytics = analytics;
    }
    async getUsageSummary(req, from, to) {
        return this.analytics.getUsageSummary(req.user.tenantId, from, to);
    }
    async getWebhookStats(req) {
        return this.analytics.getWebhookStats(req.user.tenantId);
    }
};
exports.ApiAnalyticsAdminController = ApiAnalyticsAdminController;
__decorate([
    (0, common_1.Get)('usage'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ApiAnalyticsAdminController.prototype, "getUsageSummary", null);
__decorate([
    (0, common_1.Get)('webhooks'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiAnalyticsAdminController.prototype, "getWebhookStats", null);
exports.ApiAnalyticsAdminController = ApiAnalyticsAdminController = __decorate([
    (0, common_1.Controller)('api-gateway/admin/analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [api_analytics_service_1.ApiAnalyticsService])
], ApiAnalyticsAdminController);
//# sourceMappingURL=api-analytics-admin.controller.js.map