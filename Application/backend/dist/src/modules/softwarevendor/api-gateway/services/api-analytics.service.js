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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ApiAnalyticsService = class ApiAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUsageSummary(tenantId, from, to) {
        const where = { tenantId };
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(from);
            if (to)
                where.createdAt.lte = new Date(to);
        }
        const [total, byStatus, byPath, byKey] = await Promise.all([
            this.prisma.working.apiRequestLog.aggregate({
                where,
                _count: true,
                _avg: { responseTimeMs: true },
            }),
            this.prisma.working.apiRequestLog.groupBy({
                by: ['statusCode'],
                where,
                _count: true,
            }),
            this.prisma.working.apiRequestLog.groupBy({
                by: ['path', 'method'],
                where,
                _count: true,
                _avg: { responseTimeMs: true },
                orderBy: { _count: { path: 'desc' } },
                take: 20,
            }),
            this.prisma.working.apiRequestLog.groupBy({
                by: ['apiKeyId', 'apiKeyName'],
                where,
                _count: true,
            }),
        ]);
        const statusBreakdown = byStatus.reduce((acc, s) => {
            if (s.statusCode >= 200 && s.statusCode < 300)
                acc.success += s._count;
            else if (s.statusCode >= 400 && s.statusCode < 500)
                acc.clientErrors += s._count;
            else if (s.statusCode >= 500)
                acc.serverErrors += s._count;
            if (s.statusCode === 429)
                acc.rateLimited += s._count;
            return acc;
        }, { success: 0, clientErrors: 0, serverErrors: 0, rateLimited: 0 });
        return {
            overview: {
                totalRequests: total._count,
                ...statusBreakdown,
                avgResponseTimeMs: Math.round(total._avg.responseTimeMs || 0),
                uniqueApiKeys: byKey.length,
            },
            byStatusCode: byStatus.map(s => ({ statusCode: s.statusCode, count: s._count })),
            byEndpoint: byPath.map(p => ({
                path: p.path,
                method: p.method,
                count: p._count,
                avgMs: Math.round(p._avg.responseTimeMs || 0),
            })),
            byApiKey: byKey.map(k => ({
                keyId: k.apiKeyId,
                keyName: k.apiKeyName,
                requests: k._count,
            })),
        };
    }
    async getWebhookStats(tenantId) {
        const [total, byStatus, byEvent] = await Promise.all([
            this.prisma.working.webhookDelivery.aggregate({
                where: { tenantId },
                _count: true,
                _avg: { responseTimeMs: true },
            }),
            this.prisma.working.webhookDelivery.groupBy({
                by: ['status'],
                where: { tenantId },
                _count: true,
            }),
            this.prisma.working.webhookDelivery.groupBy({
                by: ['eventType'],
                where: { tenantId },
                _count: true,
                orderBy: { _count: { eventType: 'desc' } },
            }),
        ]);
        const delivered = byStatus.find(s => s.status === 'WH_DELIVERED')?._count || 0;
        const failed = byStatus.find(s => s.status === 'WH_DELIVERY_FAILED')?._count || 0;
        return {
            totalDeliveries: total._count,
            totalDelivered: delivered,
            totalFailed: failed,
            successRate: total._count > 0 ? Math.round((delivered / total._count) * 100) : 0,
            avgResponseTimeMs: Math.round(total._avg.responseTimeMs || 0),
            byEvent: byEvent.map(e => ({ eventType: e.eventType, count: e._count })),
        };
    }
};
exports.ApiAnalyticsService = ApiAnalyticsService;
exports.ApiAnalyticsService = ApiAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiAnalyticsService);
//# sourceMappingURL=api-analytics.service.js.map