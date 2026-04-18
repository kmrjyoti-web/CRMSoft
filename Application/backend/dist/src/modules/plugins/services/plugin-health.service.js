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
var PluginHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginHealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const encryption_service_1 = require("../../softwarevendor/tenant-config/services/encryption.service");
const handler_registry_1 = require("../handlers/handler-registry");
const error_utils_1 = require("../../../common/utils/error.utils");
let PluginHealthService = PluginHealthService_1 = class PluginHealthService {
    constructor(prisma, encryption, handlerRegistry) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.handlerRegistry = handlerRegistry;
        this.logger = new common_1.Logger(PluginHealthService_1.name);
    }
    async testWithCredentials(pluginCode, credentials) {
        const handler = this.handlerRegistry.get(pluginCode);
        if (!handler) {
            return {
                success: false,
                message: `No handler registered for plugin "${pluginCode}". Connection test not available.`,
            };
        }
        try {
            return await handler.testConnection(credentials);
        }
        catch (error) {
            this.logger.error(`Health check failed for ${pluginCode}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            return {
                success: false,
                message: error instanceof Error ? (0, error_utils_1.getErrorMessage)(error) : 'Connection test failed',
            };
        }
    }
    async testInstalled(tenantId, pluginCode) {
        const plugin = await this.prisma.platform.pluginRegistry.findUnique({
            where: { code: pluginCode },
        });
        if (!plugin) {
            throw new common_1.NotFoundException(`Plugin "${pluginCode}" not found`);
        }
        const tenantPlugin = await this.prisma.platform.tenantPlugin.findUnique({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
        });
        if (!tenantPlugin) {
            throw new common_1.NotFoundException(`Plugin "${pluginCode}" not installed for this tenant`);
        }
        if (!tenantPlugin.credentials) {
            return { success: false, message: 'No credentials configured' };
        }
        const handler = this.handlerRegistry.get(pluginCode);
        if (!handler) {
            return {
                success: false,
                message: `No handler registered for plugin "${pluginCode}"`,
            };
        }
        try {
            const credentials = this.encryption.decrypt(tenantPlugin.credentials);
            const result = await handler.testConnection(credentials);
            await this.prisma.platform.tenantPlugin.update({
                where: { id: tenantPlugin.id },
                data: {
                    lastUsedAt: new Date(),
                    ...(result.success
                        ? { consecutiveErrors: 0, lastError: null }
                        : { lastError: result.message, lastErrorAt: new Date() }),
                },
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Health check failed for installed ${pluginCode}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            return {
                success: false,
                message: error instanceof Error ? (0, error_utils_1.getErrorMessage)(error) : 'Connection test failed',
            };
        }
    }
    async getTenantPluginHealth(tenantId) {
        const tenantPlugins = await this.prisma.platform.tenantPlugin.findMany({
            where: { tenantId },
            include: { plugin: true },
        });
        return tenantPlugins.map((tp) => ({
            pluginCode: tp.plugin.code,
            pluginName: tp.plugin.name,
            status: tp.status,
            isEnabled: tp.isEnabled,
            lastUsedAt: tp.lastUsedAt,
            lastErrorAt: tp.lastErrorAt,
            lastError: tp.lastError,
            errorCount: tp.errorCount,
            consecutiveErrors: tp.consecutiveErrors,
            hasHandler: this.handlerRegistry.has(tp.plugin.code),
        }));
    }
};
exports.PluginHealthService = PluginHealthService;
exports.PluginHealthService = PluginHealthService = PluginHealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        handler_registry_1.PluginHandlerRegistry])
], PluginHealthService);
//# sourceMappingURL=plugin-health.service.js.map