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
var PluginHookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginHookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const plugin_service_1 = require("./plugin.service");
const handler_registry_1 = require("../handlers/handler-registry");
const encryption_service_1 = require("../../softwarevendor/tenant-config/services/encryption.service");
const error_utils_1 = require("../../../common/utils/error.utils");
let PluginHookService = PluginHookService_1 = class PluginHookService {
    constructor(prisma, pluginService, handlerRegistry, encryption) {
        this.prisma = prisma;
        this.pluginService = pluginService;
        this.handlerRegistry = handlerRegistry;
        this.encryption = encryption;
        this.logger = new common_1.Logger(PluginHookService_1.name);
    }
    async fireHook(hookPoint, payload) {
        const { tenantId, entityType, entityId, data } = payload;
        this.logger.debug(`Firing hook: ${hookPoint} for tenant ${tenantId}`);
        const tenantPlugins = await this.prisma.platform.tenantPlugin.findMany({
            where: {
                tenantId,
                isEnabled: true,
                status: 'TP_ACTIVE',
                plugin: {
                    hookPoints: { has: hookPoint },
                    status: 'PLUGIN_ACTIVE',
                },
            },
            include: { plugin: true },
        });
        if (tenantPlugins.length === 0)
            return;
        for (const tenantPlugin of tenantPlugins) {
            const startTime = Date.now();
            try {
                let responsePayload = null;
                const handler = this.handlerRegistry.get(tenantPlugin.plugin.code);
                if (handler) {
                    let credentials = {};
                    if (tenantPlugin.credentials) {
                        try {
                            credentials = this.encryption.decrypt(tenantPlugin.credentials);
                        }
                        catch {
                            this.logger.error(`Failed to decrypt credentials for ${tenantPlugin.plugin.code}`);
                        }
                    }
                    responsePayload = await handler.handle(hookPoint, payload, credentials, tenantPlugin.settings || {});
                }
                else {
                    this.logger.debug(`No handler for plugin ${tenantPlugin.plugin.code}, logging only`);
                }
                await this.logHookExecution(tenantId, tenantPlugin.pluginId, hookPoint, entityType, entityId, 'SUCCESS', Date.now() - startTime, data, null, responsePayload);
                await this.pluginService.clearErrors(tenantId, tenantPlugin.plugin.code);
                await this.pluginService.recordUsage(tenantId, tenantPlugin.plugin.code);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                await this.logHookExecution(tenantId, tenantPlugin.pluginId, hookPoint, entityType, entityId, 'FAILED', Date.now() - startTime, data, errorMessage);
                await this.pluginService.recordError(tenantId, tenantPlugin.plugin.code, errorMessage);
                this.logger.error(`Hook ${hookPoint} failed for plugin ${tenantPlugin.plugin.code}: ${errorMessage}`);
            }
        }
    }
    async getPluginsForHook(tenantId, hookPoint) {
        return this.prisma.platform.tenantPlugin.findMany({
            where: {
                tenantId,
                isEnabled: true,
                status: 'TP_ACTIVE',
                plugin: { hookPoints: { has: hookPoint } },
            },
            include: { plugin: true },
        });
    }
    async getHookLogs(tenantId, filters) {
        return this.prisma.platform.pluginHookLog.findMany({
            where: {
                tenantId,
                ...(filters?.pluginId && { pluginId: filters.pluginId }),
                ...(filters?.hookPoint && { hookPoint: filters.hookPoint }),
                ...(filters?.status && { status: filters.status }),
            },
            orderBy: { executedAt: 'desc' },
            take: filters?.limit || 100,
        });
    }
    async logHookExecution(tenantId, pluginId, hookPoint, entityType, entityId, status, durationMs, requestPayload, errorMessage, responsePayload) {
        try {
            await this.prisma.platform.pluginHookLog.create({
                data: {
                    tenantId,
                    pluginId,
                    hookPoint,
                    entityType,
                    entityId,
                    status,
                    durationMs,
                    requestPayload: requestPayload
                        ? JSON.parse(JSON.stringify(requestPayload))
                        : undefined,
                    responsePayload: responsePayload
                        ? JSON.parse(JSON.stringify(responsePayload))
                        : undefined,
                    errorMessage,
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to log hook execution: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
    }
};
exports.PluginHookService = PluginHookService;
exports.PluginHookService = PluginHookService = PluginHookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plugin_service_1.PluginService,
        handler_registry_1.PluginHandlerRegistry,
        encryption_service_1.EncryptionService])
], PluginHookService);
//# sourceMappingURL=plugin-hook.service.js.map