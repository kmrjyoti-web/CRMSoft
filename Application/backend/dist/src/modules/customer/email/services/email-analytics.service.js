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
exports.EmailAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let EmailAnalyticsService = class EmailAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverallAnalytics(userId, dateFrom, dateTo) {
        const accountWhere = {};
        if (userId)
            accountWhere.userId = userId;
        const accounts = await this.prisma.working.emailAccount.findMany({
            where: accountWhere,
            select: { id: true },
        });
        const accountIds = accounts.map(a => a.id);
        if (accountIds.length === 0)
            return this.emptyAnalytics();
        const emailWhere = { accountId: { in: accountIds } };
        if (dateFrom || dateTo) {
            emailWhere.createdAt = {};
            if (dateFrom)
                emailWhere.createdAt.gte = dateFrom;
            if (dateTo)
                emailWhere.createdAt.lte = dateTo;
        }
        const [totalSent, totalReceived, totalOpened, totalClicked, totalBounced, totalReplied] = await Promise.all([
            this.prisma.working.email.count({ where: { ...emailWhere, direction: 'OUTBOUND', status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED'] } } }),
            this.prisma.working.email.count({ where: { ...emailWhere, direction: 'INBOUND' } }),
            this.prisma.working.email.count({ where: { ...emailWhere, direction: 'OUTBOUND', openCount: { gt: 0 } } }),
            this.prisma.working.email.count({ where: { ...emailWhere, direction: 'OUTBOUND', clickCount: { gt: 0 } } }),
            this.prisma.working.email.count({ where: { ...emailWhere, isBounced: true } }),
            this.prisma.working.email.count({ where: { ...emailWhere, isReplied: true } }),
        ]);
        const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
        const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
        const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0;
        const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;
        return {
            totalSent,
            totalReceived,
            totalOpened,
            totalClicked,
            totalBounced,
            totalReplied,
            openRate,
            clickRate,
            bounceRate,
            replyRate,
        };
    }
    async getCampaignStats(campaignId) {
        const campaign = await this.prisma.working.emailCampaign.findUniqueOrThrow({
            where: { id: campaignId },
        });
        const recipientStats = await this.prisma.working.campaignRecipient.groupBy({
            by: ['status'],
            where: { campaignId },
            _count: { id: true },
        });
        const statusMap = recipientStats.reduce((acc, s) => {
            acc[s.status] = s._count.id;
            return acc;
        }, {});
        const totalSent = campaign.sentCount || statusMap['SENT'] || 0;
        const openRate = totalSent > 0 ? Math.round((campaign.openedCount / totalSent) * 100) : 0;
        const clickRate = totalSent > 0 ? Math.round((campaign.clickedCount / totalSent) * 100) : 0;
        return {
            campaign: {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                totalRecipients: campaign.totalRecipients,
                startedAt: campaign.startedAt,
                completedAt: campaign.completedAt,
            },
            stats: {
                sent: campaign.sentCount,
                delivered: campaign.deliveredCount,
                opened: campaign.openedCount,
                clicked: campaign.clickedCount,
                replied: campaign.repliedCount,
                bounced: campaign.bouncedCount,
                failed: campaign.failedCount,
                unsubscribed: campaign.unsubscribedCount,
                openRate,
                clickRate,
            },
            recipientBreakdown: statusMap,
        };
    }
    emptyAnalytics() {
        return {
            totalSent: 0, totalReceived: 0, totalOpened: 0, totalClicked: 0,
            totalBounced: 0, totalReplied: 0, openRate: 0, clickRate: 0, bounceRate: 0, replyRate: 0,
        };
    }
};
exports.EmailAnalyticsService = EmailAnalyticsService;
exports.EmailAnalyticsService = EmailAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailAnalyticsService);
//# sourceMappingURL=email-analytics.service.js.map