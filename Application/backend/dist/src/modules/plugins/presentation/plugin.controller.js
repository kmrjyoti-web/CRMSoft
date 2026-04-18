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
exports.PluginController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../core/permissions/decorators/require-permissions.decorator");
const plugin_service_1 = require("../services/plugin.service");
const plugin_hook_service_1 = require("../services/plugin-hook.service");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let PluginController = class PluginController {
    constructor(pluginService, hookService, prisma) {
        this.pluginService = pluginService;
        this.hookService = hookService;
        this.prisma = prisma;
    }
    async getCatalog(category) {
        if (category) {
            return this.pluginService.getPluginsByCategory(category);
        }
        return this.pluginService.getAllPlugins();
    }
    async getPluginDetails(code) {
        return this.pluginService.getPluginByCode(code);
    }
    async getInstalledPlugins(tenantId) {
        return this.pluginService.getTenantPlugins(tenantId);
    }
    async getInstalledPlugin(tenantId, code) {
        const plugin = await this.pluginService.getTenantPlugin(tenantId, code);
        if (plugin) {
            return {
                ...plugin,
                credentials: undefined,
                hasCredentials: !!plugin.credentials,
            };
        }
        return null;
    }
    async installPlugin(tenantId, userId, code, body) {
        return this.pluginService.enablePlugin(tenantId, code, body.credentials, body.settings, userId);
    }
    async updateCredentials(tenantId, userId, code, body) {
        return this.pluginService.updateCredentials(tenantId, code, body.credentials, userId);
    }
    async updateSettings(tenantId, code, body) {
        const plugin = await this.pluginService.getPluginByCode(code);
        await this.prisma.platform.tenantPlugin.update({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            data: { settings: body.settings },
        });
        return { success: true };
    }
    async enablePlugin(tenantId, userId, code) {
        const existing = await this.pluginService.getTenantPlugin(tenantId, code);
        if (!existing?.credentials) {
            throw new common_1.BadRequestException('Plugin credentials not configured. Install the plugin first.');
        }
        const plugin = await this.pluginService.getPluginByCode(code);
        await this.prisma.platform.tenantPlugin.update({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            data: {
                isEnabled: true,
                status: 'TP_ACTIVE',
                enabledAt: new Date(),
                disabledAt: null,
                errorCount: 0,
                consecutiveErrors: 0,
                lastError: null,
                updatedById: userId,
            },
        });
        return { success: true, code };
    }
    async disablePlugin(tenantId, userId, code) {
        return this.pluginService.disablePlugin(tenantId, code, userId);
    }
    async getPluginLogs(tenantId, code, limit = '100', hookPoint, status) {
        const plugin = await this.pluginService.getPluginByCode(code);
        return this.hookService.getHookLogs(tenantId, {
            pluginId: plugin.id,
            hookPoint,
            status,
            limit: parseInt(limit),
        });
    }
    async checkPluginStatus(tenantId, code) {
        const enabled = await this.pluginService.isPluginEnabled(tenantId, code);
        return { code, enabled };
    }
};
exports.PluginController = PluginController;
__decorate([
    (0, common_1.Get)('catalog'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "getCatalog", null);
__decorate([
    (0, common_1.Get)('catalog/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "getPluginDetails", null);
__decorate([
    (0, common_1.Get)('installed'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:view'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "getInstalledPlugins", null);
__decorate([
    (0, common_1.Get)('installed/:code'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:view'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "getInstalledPlugin", null);
__decorate([
    (0, common_1.Post)('install/:code'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('code')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "installPlugin", null);
__decorate([
    (0, common_1.Put)(':code/credentials'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('code')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "updateCredentials", null);
__decorate([
    (0, common_1.Put)(':code/settings'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('code')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)(':code/enable'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "enablePlugin", null);
__decorate([
    (0, common_1.Post)(':code/disable'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "disablePlugin", null);
__decorate([
    (0, common_1.Get)(':code/logs'),
    (0, require_permissions_decorator_1.RequirePermissions)('plugins:view'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('code')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('hookPoint')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, String]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "getPluginLogs", null);
__decorate([
    (0, common_1.Get)('check/:code'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PluginController.prototype, "checkPluginStatus", null);
exports.PluginController = PluginController = __decorate([
    (0, common_1.Controller)('plugins'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [plugin_service_1.PluginService,
        plugin_hook_service_1.PluginHookService,
        prisma_service_1.PrismaService])
], PluginController);
//# sourceMappingURL=plugin.controller.js.map