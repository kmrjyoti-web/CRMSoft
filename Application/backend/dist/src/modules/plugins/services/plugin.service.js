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
var PluginService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const encryption_service_1 = require("../../softwarevendor/tenant-config/services/encryption.service");
const plugin_menu_service_1 = require("./plugin-menu.service");
const industry_filter_util_1 = require("../../../common/utils/industry-filter.util");
const error_utils_1 = require("../../../common/utils/error.utils");
let PluginService = PluginService_1 = class PluginService {
    constructor(prisma, encryption, menuService) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.menuService = menuService;
        this.logger = new common_1.Logger(PluginService_1.name);
    }
    async getAllPlugins(industryCode) {
        return this.prisma.platform.pluginRegistry.findMany({
            where: { status: 'PLUGIN_ACTIVE', ...(0, industry_filter_util_1.industryFilter)(industryCode) },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        });
    }
    async getPluginsByCategory(category, industryCode) {
        return this.prisma.platform.pluginRegistry.findMany({
            where: { category, status: 'PLUGIN_ACTIVE', ...(0, industry_filter_util_1.industryFilter)(industryCode) },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async getPluginByCode(code) {
        const plugin = await this.prisma.platform.pluginRegistry.findUnique({
            where: { code },
        });
        if (!plugin) {
            throw new common_1.NotFoundException(`Plugin "${code}" not found`);
        }
        return plugin;
    }
    async getTenantPlugins(tenantId) {
        return this.prisma.platform.tenantPlugin.findMany({
            where: { tenantId },
            include: { plugin: true },
            orderBy: { plugin: { category: 'asc' } },
        });
    }
    async getTenantPlugin(tenantId, pluginCode) {
        const plugin = await this.getPluginByCode(pluginCode);
        return this.prisma.platform.tenantPlugin.findUnique({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            include: { plugin: true },
        });
    }
    async getEnabledPlugins(tenantId) {
        return this.prisma.platform.tenantPlugin.findMany({
            where: { tenantId, isEnabled: true, status: 'TP_ACTIVE' },
            include: { plugin: true },
        });
    }
    async enablePlugin(tenantId, pluginCode, credentials, settings, userId) {
        const plugin = await this.getPluginByCode(pluginCode);
        this.validateCredentials(credentials, plugin.configSchema);
        const encryptedCredentials = this.encryption.encrypt(credentials);
        const webhookUrl = plugin.webhookConfig
            ? this.generateWebhookUrl(pluginCode, tenantId)
            : null;
        const tenantPlugin = await this.prisma.platform.tenantPlugin.upsert({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            update: {
                credentials: encryptedCredentials,
                settings: settings || {},
                isEnabled: true,
                status: 'TP_ACTIVE',
                enabledAt: new Date(),
                disabledAt: null,
                errorCount: 0,
                consecutiveErrors: 0,
                lastError: null,
                webhookUrl,
                updatedById: userId,
            },
            create: {
                tenantId,
                pluginId: plugin.id,
                credentials: encryptedCredentials,
                settings: settings || {},
                isEnabled: true,
                status: 'TP_ACTIVE',
                enabledAt: new Date(),
                webhookUrl,
                createdById: userId,
            },
            include: { plugin: true },
        });
        this.logger.log(`Plugin "${pluginCode}" enabled for tenant ${tenantId}`);
        try {
            await this.menuService.enableMenusForPlugin(tenantId, pluginCode);
        }
        catch (err) {
            this.logger.warn(`Failed to auto-enable menus for plugin "${pluginCode}": ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
        return {
            ...tenantPlugin,
            credentials: undefined,
            webhookUrl,
        };
    }
    async disablePlugin(tenantId, pluginCode, userId) {
        const plugin = await this.getPluginByCode(pluginCode);
        const tenantPlugin = await this.prisma.platform.tenantPlugin.update({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            data: {
                isEnabled: false,
                status: 'TP_INACTIVE',
                disabledAt: new Date(),
                updatedById: userId,
            },
        });
        this.logger.log(`Plugin "${pluginCode}" disabled for tenant ${tenantId}`);
        try {
            await this.menuService.disableMenusForPlugin(tenantId, pluginCode);
        }
        catch (err) {
            this.logger.warn(`Failed to auto-disable menus for plugin "${pluginCode}": ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
        return tenantPlugin;
    }
    async updateCredentials(tenantId, pluginCode, credentials, userId) {
        const plugin = await this.getPluginByCode(pluginCode);
        this.validateCredentials(credentials, plugin.configSchema);
        const encryptedCredentials = this.encryption.encrypt(credentials);
        await this.prisma.platform.tenantPlugin.update({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            data: {
                credentials: encryptedCredentials,
                errorCount: 0,
                consecutiveErrors: 0,
                lastError: null,
                updatedById: userId,
            },
        });
        return { success: true };
    }
    async getDecryptedCredentials(tenantId, pluginCode) {
        const tenantPlugin = await this.getTenantPlugin(tenantId, pluginCode);
        if (!tenantPlugin?.credentials)
            return null;
        if (!tenantPlugin.isEnabled) {
            throw new common_1.BadRequestException(`Plugin "${pluginCode}" is not enabled`);
        }
        try {
            return this.encryption.decrypt(tenantPlugin.credentials);
        }
        catch {
            this.logger.error(`Failed to decrypt credentials for plugin ${pluginCode}`);
            throw new common_1.BadRequestException('Failed to decrypt plugin credentials');
        }
    }
    async isPluginEnabled(tenantId, pluginCode) {
        const tp = await this.getTenantPlugin(tenantId, pluginCode);
        return tp?.isEnabled === true && tp?.status === 'TP_ACTIVE';
    }
    async recordUsage(tenantId, pluginCode) {
        const plugin = await this.getPluginByCode(pluginCode);
        await this.prisma.platform.tenantPlugin.update({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            data: {
                monthlyUsage: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });
    }
    async recordError(tenantId, pluginCode, errorMessage) {
        const plugin = await this.getPluginByCode(pluginCode);
        const tenantPlugin = await this.prisma.platform.tenantPlugin.update({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            data: {
                errorCount: { increment: 1 },
                consecutiveErrors: { increment: 1 },
                lastError: errorMessage,
                lastErrorAt: new Date(),
            },
        });
        if (tenantPlugin.consecutiveErrors >= 10) {
            await this.prisma.platform.tenantPlugin.update({
                where: { id: tenantPlugin.id },
                data: { status: 'TP_ERROR', isEnabled: false },
            });
            this.logger.warn(`Plugin "${pluginCode}" auto-disabled for tenant ${tenantId} after ${tenantPlugin.consecutiveErrors} consecutive errors`);
        }
    }
    async clearErrors(tenantId, pluginCode) {
        const plugin = await this.getPluginByCode(pluginCode);
        await this.prisma.platform.tenantPlugin.update({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
            data: { consecutiveErrors: 0, status: 'TP_ACTIVE' },
        });
    }
    validateCredentials(credentials, schema) {
        if (!schema?.fields)
            return;
        for (const field of schema.fields) {
            if (field.required && !credentials[field.name]) {
                throw new common_1.BadRequestException(`Missing required field: ${field.label || field.name}`);
            }
        }
    }
    generateWebhookUrl(pluginCode, tenantId) {
        const baseUrl = process.env.API_BASE_URL || 'https://api.example.com';
        return `${baseUrl}/webhooks/${pluginCode}/${tenantId}`;
    }
};
exports.PluginService = PluginService;
exports.PluginService = PluginService = PluginService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => plugin_menu_service_1.PluginMenuService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        plugin_menu_service_1.PluginMenuService])
], PluginService);
//# sourceMappingURL=plugin.service.js.map