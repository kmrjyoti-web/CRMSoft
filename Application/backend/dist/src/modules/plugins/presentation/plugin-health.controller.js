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
exports.PluginHealthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../core/permissions/decorators/require-permissions.decorator");
const plugin_health_service_1 = require("../services/plugin-health.service");
let PluginHealthController = class PluginHealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    async testInstalledPlugin(tenantId, code) {
        return this.healthService.testInstalled(tenantId, code);
    }
    async testWithCredentials(code, body) {
        return this.healthService.testWithCredentials(code, body.credentials);
    }
    async getHealthSummary(tenantId) {
        return this.healthService.getTenantPluginHealth(tenantId);
    }
};
exports.PluginHealthController = PluginHealthController;
__decorate([
    (0, common_1.Post)(':code/test'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PluginHealthController.prototype, "testInstalledPlugin", null);
__decorate([
    (0, common_1.Post)(':code/test-credentials'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:manage'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PluginHealthController.prototype, "testWithCredentials", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:view'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PluginHealthController.prototype, "getHealthSummary", null);
exports.PluginHealthController = PluginHealthController = __decorate([
    (0, common_1.Controller)('plugins/health'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [plugin_health_service_1.PluginHealthService])
], PluginHealthController);
//# sourceMappingURL=plugin-health.controller.js.map