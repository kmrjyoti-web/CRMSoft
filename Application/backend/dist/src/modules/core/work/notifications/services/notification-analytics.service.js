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
var NotificationAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let NotificationAnalyticsService = NotificationAnalyticsService_1 = class NotificationAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationAnalyticsService_1.name);
    }
    async getAnalytics(tenantId, startDate, endDate) {
        const dateFilter = {
            tenantId,
            createdAt: { gte: startDate, lte: endDate },
        };
        const totalSent = await this.prisma.notification.count({
            where: { ...dateFilter, isActive: true },
        });
        const deliveredCount = await this.prisma.notification.count({
            where: { ...dateFilter, isActive: true, deliveredAt: { not: null } },
        });
        const readCount = await this.prisma.notification.count({
            where: { ...dateFilter, isActive: true, readAt: { not: null } },
        });
        const failedCount = await this.prisma.notification.count({
            where: { ...dateFilter, isActive: true, failedAt: { not: null } },
        });
        const deliveryRate = totalSent > 0 ? Math.round((deliveredCount / totalSent) * 10000) / 100 : 0;
        const readRate = totalSent > 0 ? Math.round((readCount / totalSent) * 10000) / 100 : 0;
        const failureRate = totalSent > 0 ? Math.round((failedCount / totalSent) * 10000) / 100 : 0;
        const byChannelRaw = await this.prisma.communicationLog.groupBy({
            by: ['channel'],
            where: {
                tenantId,
                createdAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });
        const byChannel = byChannelRaw.map((row) => ({
            channel: row.channel,
            count: row._count.id,
        }));
        const byEventRaw = await this.prisma.notification.groupBy({
            by: ['eventType'],
            where: {
                ...dateFilter,
                isActive: true,
                eventType: { not: null },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });
        const byEvent = byEventRaw.map((row) => ({
            eventType: row.eventType || 'UNKNOWN',
            count: row._count.id,
        }));
        const failedNotifications = await this.prisma.notification.findMany({
            where: {
                ...dateFilter,
                isActive: true,
                failedAt: { not: null },
                failureReason: { not: null },
            },
            select: { failureReason: true },
        });
        const reasonCounts = {};
        for (const n of failedNotifications) {
            const reason = n.failureReason || 'Unknown';
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        }
        const topFailureReasons = Object.entries(reasonCounts)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalSent,
            deliveryRate,
            readRate,
            failureRate,
            byChannel,
            byEvent,
            topFailureReasons,
        };
    }
};
exports.NotificationAnalyticsService = NotificationAnalyticsService;
exports.NotificationAnalyticsService = NotificationAnalyticsService = NotificationAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationAnalyticsService);
//# sourceMappingURL=notification-analytics.service.js.map