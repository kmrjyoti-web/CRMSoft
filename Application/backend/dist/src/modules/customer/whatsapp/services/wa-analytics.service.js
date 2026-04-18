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
exports.WaAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WaAnalyticsService = class WaAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverallAnalytics(wabaId, dateFrom, dateTo) {
        const messageWhere = { wabaId };
        if (dateFrom || dateTo) {
            messageWhere.createdAt = {};
            if (dateFrom)
                messageWhere.createdAt.gte = dateFrom;
            if (dateTo)
                messageWhere.createdAt.lte = dateTo;
        }
        const [totalSent, totalReceived, totalDelivered, totalRead, totalFailed, totalConversations, openConversations, resolvedConversations,] = await Promise.all([
            this.prisma.working.waMessage.count({ where: { ...messageWhere, direction: 'OUTBOUND' } }),
            this.prisma.working.waMessage.count({ where: { ...messageWhere, direction: 'INBOUND' } }),
            this.prisma.working.waMessage.count({ where: { ...messageWhere, direction: 'OUTBOUND', status: 'DELIVERED' } }),
            this.prisma.working.waMessage.count({ where: { ...messageWhere, direction: 'OUTBOUND', status: 'READ' } }),
            this.prisma.working.waMessage.count({ where: { ...messageWhere, direction: 'OUTBOUND', status: 'FAILED' } }),
            this.prisma.working.waConversation.count({ where: { wabaId } }),
            this.prisma.working.waConversation.count({ where: { wabaId, status: 'OPEN' } }),
            this.prisma.working.waConversation.count({ where: { wabaId, status: 'RESOLVED' } }),
        ]);
        const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
        const readRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;
        return {
            totalSent,
            totalReceived,
            totalDelivered,
            totalRead,
            totalFailed,
            deliveryRate,
            readRate,
            totalConversations,
            openConversations,
            resolvedConversations,
        };
    }
    async getAgentPerformance(wabaId, dateFrom, dateTo) {
        const conversationWhere = { wabaId, assignedToId: { not: null } };
        const assignedConversations = await this.prisma.working.waConversation.findMany({
            where: conversationWhere,
            select: {
                assignedToId: true,
                status: true,
                messageCount: true,
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        const agentMap = new Map();
        for (const conv of assignedConversations) {
            if (!conv.assignedToId)
                continue;
            if (!agentMap.has(conv.assignedToId)) {
                agentMap.set(conv.assignedToId, {
                    userId: conv.assignedToId,
                    name: `${conv.assignedTo?.firstName || ''} ${conv.assignedTo?.lastName || ''}`.trim(),
                    totalAssigned: 0,
                    resolved: 0,
                    open: 0,
                    totalMessages: 0,
                });
            }
            const agent = agentMap.get(conv.assignedToId);
            agent.totalAssigned++;
            if (conv.status === 'RESOLVED')
                agent.resolved++;
            if (conv.status === 'OPEN')
                agent.open++;
            agent.totalMessages += conv.messageCount;
        }
        return Array.from(agentMap.values());
    }
    async getBroadcastStats(broadcastId) {
        const broadcast = await this.prisma.working.waBroadcast.findUniqueOrThrow({
            where: { id: broadcastId },
        });
        const recipientStats = await this.prisma.working.waBroadcastRecipient.groupBy({
            by: ['status'],
            where: { broadcastId },
            _count: { id: true },
        });
        const statusMap = recipientStats.reduce((acc, s) => {
            acc[s.status] = s._count.id;
            return acc;
        }, {});
        return {
            broadcast: {
                id: broadcast.id,
                name: broadcast.name,
                status: broadcast.status,
                totalRecipients: broadcast.totalRecipients,
                startedAt: broadcast.startedAt,
                completedAt: broadcast.completedAt,
            },
            stats: {
                sent: broadcast.sentCount,
                delivered: broadcast.deliveredCount,
                read: broadcast.readCount,
                failed: broadcast.failedCount,
                optedOut: broadcast.optOutCount,
            },
            recipientBreakdown: statusMap,
        };
    }
};
exports.WaAnalyticsService = WaAnalyticsService;
exports.WaAnalyticsService = WaAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaAnalyticsService);
//# sourceMappingURL=wa-analytics.service.js.map