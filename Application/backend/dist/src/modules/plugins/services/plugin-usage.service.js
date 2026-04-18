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
var PluginUsageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginUsageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
let PluginUsageService = PluginUsageService_1 = class PluginUsageService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PluginUsageService_1.name);
    }
    async getTenantUsage(tenantId) {
        const tenantPlugins = await this.prisma.platform.tenantPlugin.findMany({
            where: { tenantId },
            include: { plugin: true },
            orderBy: { plugin: { category: 'asc' } },
        });
        return tenantPlugins.map((tp) => ({
            pluginCode: tp.plugin.code,
            pluginName: tp.plugin.name,
            category: tp.plugin.category,
            monthlyUsage: tp.monthlyUsage,
            monthlyLimit: tp.monthlyLimit,
            usagePercent: tp.monthlyLimit
                ? Math.round((tp.monthlyUsage / tp.monthlyLimit) * 100)
                : null,
            lastUsedAt: tp.lastUsedAt,
            isEnabled: tp.isEnabled,
        }));
    }
    async getTenantStats(tenantId) {
        const tenantPlugins = await this.prisma.platform.tenantPlugin.findMany({
            where: { tenantId },
            include: { plugin: true },
        });
        const byCategory = {};
        let totalUsage = 0;
        let activePlugins = 0;
        for (const tp of tenantPlugins) {
            totalUsage += tp.monthlyUsage;
            if (tp.isEnabled)
                activePlugins++;
            const cat = tp.plugin.category;
            byCategory[cat] = (byCategory[cat] || 0) + tp.monthlyUsage;
        }
        return {
            totalPlugins: tenantPlugins.length,
            activePlugins,
            totalUsage,
            byCategory,
        };
    }
    async resetMonthlyUsage() {
        const result = await this.prisma.platform.tenantPlugin.updateMany({
            where: { monthlyUsage: { gt: 0 } },
            data: {
                monthlyUsage: 0,
                usageResetAt: new Date(),
            },
        });
        this.logger.log(`Monthly usage reset for ${result.count} tenant plugins`);
        return result.count;
    }
    async checkQuota(tenantId, pluginCode) {
        const plugin = await this.prisma.platform.pluginRegistry.findUnique({
            where: { code: pluginCode },
        });
        if (!plugin)
            return { allowed: false, usage: 0, limit: null };
        const tp = await this.prisma.platform.tenantPlugin.findUnique({
            where: {
                tenantId_pluginId: { tenantId, pluginId: plugin.id },
            },
        });
        if (!tp || !tp.isEnabled) {
            return { allowed: false, usage: 0, limit: null };
        }
        const allowed = tp.monthlyLimit === null || tp.monthlyUsage < tp.monthlyLimit;
        return {
            allowed,
            usage: tp.monthlyUsage,
            limit: tp.monthlyLimit,
        };
    }
    async getRecentActivity(tenantId, pluginCode, limit = 50) {
        const plugin = pluginCode
            ? await this.prisma.platform.pluginRegistry.findUnique({ where: { code: pluginCode } })
            : null;
        return this.prisma.platform.pluginHookLog.findMany({
            where: {
                tenantId,
                ...(plugin ? { pluginId: plugin.id } : {}),
            },
            orderBy: { executedAt: 'desc' },
            take: limit,
        });
    }
};
exports.PluginUsageService = PluginUsageService;
exports.PluginUsageService = PluginUsageService = PluginUsageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PluginUsageService);
//# sourceMappingURL=plugin-usage.service.js.map