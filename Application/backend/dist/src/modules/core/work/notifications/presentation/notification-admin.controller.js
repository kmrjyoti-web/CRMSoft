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
exports.NotificationAdminController = void 0;
const common_1 = require("@nestjs/common");
const require_permissions_decorator_1 = require("../../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const notification_config_service_1 = require("../services/notification-config.service");
const escalation_service_1 = require("../services/escalation.service");
const quiet_hour_service_1 = require("../services/quiet-hour.service");
const notification_analytics_service_1 = require("../services/notification-analytics.service");
let NotificationAdminController = class NotificationAdminController {
    constructor(configService, escalationService, quietHourService, analyticsService) {
        this.configService = configService;
        this.escalationService = escalationService;
        this.quietHourService = quietHourService;
        this.analyticsService = analyticsService;
    }
    async getAllConfigs() {
        const result = await this.configService.getAllConfigs();
        return api_response_1.ApiResponse.success(result);
    }
    async upsertConfig(eventType, body) {
        const result = await this.configService.upsertConfig(eventType, body.channels, body.templateId);
        return api_response_1.ApiResponse.success(result, 'Config updated');
    }
    async getAllRules() {
        const result = await this.escalationService.getAllRules();
        return api_response_1.ApiResponse.success(result);
    }
    async createRule(body) {
        const result = await this.escalationService.createRule(body);
        return api_response_1.ApiResponse.success(result, 'Rule created');
    }
    async updateRule(id, body) {
        const result = await this.escalationService.updateRule(id, body);
        return api_response_1.ApiResponse.success(result, 'Rule updated');
    }
    async deleteRule(id) {
        const result = await this.escalationService.deleteRule(id);
        return api_response_1.ApiResponse.success(result, 'Rule deleted');
    }
    async getAllQuietHours() {
        const result = await this.quietHourService.listConfigs();
        return api_response_1.ApiResponse.success(result);
    }
    async createQuietHour(body) {
        const result = await this.quietHourService.createConfig(body);
        return api_response_1.ApiResponse.success(result, 'Quiet hour config created');
    }
    async updateQuietHour(id, body) {
        const result = await this.quietHourService.updateConfig(id, body);
        return api_response_1.ApiResponse.success(result, 'Quiet hour config updated');
    }
    async deleteQuietHour(id) {
        const result = await this.quietHourService.deleteConfig(id);
        return api_response_1.ApiResponse.success(result, 'Quiet hour config deleted');
    }
    async getAnalytics(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const result = await this.analyticsService.getAnalytics('', start, end);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.NotificationAdminController = NotificationAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "getAllConfigs", null);
__decorate([
    (0, common_1.Put)(':eventType'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('eventType')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "upsertConfig", null);
__decorate([
    (0, common_1.Get)('escalation-rules'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "getAllRules", null);
__decorate([
    (0, common_1.Post)('escalation-rules'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "createRule", null);
__decorate([
    (0, common_1.Put)('escalation-rules/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)('escalation-rules/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Get)('quiet-hours'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "getAllQuietHours", null);
__decorate([
    (0, common_1.Post)('quiet-hours'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "createQuietHour", null);
__decorate([
    (0, common_1.Put)('quiet-hours/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "updateQuietHour", null);
__decorate([
    (0, common_1.Delete)('quiet-hours/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "deleteQuietHour", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:read'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationAdminController.prototype, "getAnalytics", null);
exports.NotificationAdminController = NotificationAdminController = __decorate([
    (0, common_1.Controller)('notification-configs'),
    __metadata("design:paramtypes", [notification_config_service_1.NotificationConfigService,
        escalation_service_1.EscalationService,
        quiet_hour_service_1.QuietHourService,
        notification_analytics_service_1.NotificationAnalyticsService])
], NotificationAdminController);
//# sourceMappingURL=notification-admin.controller.js.map