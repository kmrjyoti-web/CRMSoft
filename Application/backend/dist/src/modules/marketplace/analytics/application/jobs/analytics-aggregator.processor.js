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
var AnalyticsAggregatorProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsAggregatorProcessor = exports.ANALYTICS_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const mkt_prisma_service_1 = require("../../infrastructure/mkt-prisma.service");
exports.ANALYTICS_QUEUE = 'marketplace-analytics';
let AnalyticsAggregatorProcessor = AnalyticsAggregatorProcessor_1 = class AnalyticsAggregatorProcessor {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(AnalyticsAggregatorProcessor_1.name);
    }
    async handleComputeSummary(job) {
        const { tenantId, entityType, entityId } = job.data;
        this.logger.log(`Computing analytics summary for ${entityType}/${entityId}`);
        const events = await this.mktPrisma.client.mktAnalyticsEvent.findMany({
            where: { tenantId, entityType: entityType, entityId },
        });
        if (events.length === 0)
            return;
        const impressions = events.filter((e) => e.eventType === 'IMPRESSION').length;
        const clicks = events.filter((e) => e.eventType === 'CLICK').length;
        const enquiries = events.filter((e) => e.eventType === 'ENQUIRY').length;
        const leads = events.filter((e) => e.eventType === 'LEAD').length;
        const orders = events.filter((e) => e.eventType === 'ORDER').length;
        const totalOrderValue = events
            .filter((e) => e.eventType === 'ORDER' && e.orderValue)
            .reduce((sum, e) => sum + (e.orderValue ?? 0), 0);
        const uniqueImpressionUsers = new Set(events.filter((e) => e.eventType === 'IMPRESSION' && e.userId).map((e) => e.userId)).size;
        const uniqueClickUsers = new Set(events.filter((e) => e.eventType === 'CLICK' && e.userId).map((e) => e.userId)).size;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const enquiryRate = clicks > 0 ? (enquiries / clicks) * 100 : 0;
        const leadConversionRate = enquiries > 0 ? (leads / enquiries) * 100 : 0;
        const orderConversionRate = leads > 0 ? (orders / leads) * 100 : 0;
        const cityMap = {};
        const stateMap = {};
        const deviceMap = {};
        const sourceMap = {};
        const hourMap = {};
        for (const event of events) {
            if (event.city)
                cityMap[event.city] = (cityMap[event.city] || 0) + 1;
            if (event.state)
                stateMap[event.state] = (stateMap[event.state] || 0) + 1;
            if (event.deviceType)
                deviceMap[event.deviceType] = (deviceMap[event.deviceType] || 0) + 1;
            const src = event.source || 'FEED';
            sourceMap[src] = (sourceMap[src] || 0) + 1;
            const hour = new Date(event.timestamp).getHours();
            hourMap[hour] = (hourMap[hour] || 0) + 1;
        }
        const topCities = Object.entries(cityMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([city, count]) => ({ city, count }));
        const topStates = Object.entries(stateMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([state, count]) => ({ state, count }));
        const peakHours = Object.entries(hourMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }));
        const relFields = {};
        if (entityType === 'LISTING')
            relFields.listingId = entityId;
        if (entityType === 'POST')
            relFields.postId = entityId;
        if (entityType === 'OFFER')
            relFields.offerId = entityId;
        const existing = await this.mktPrisma.client.mktAnalyticsSummary.findFirst({
            where: { tenantId, entityType: entityType, entityId },
        });
        const summaryData = {
            tenantId,
            entityType: entityType,
            entityId,
            impressions,
            uniqueImpressions: uniqueImpressionUsers,
            clicks,
            uniqueClicks: uniqueClickUsers,
            ctr: Math.round(ctr * 100) / 100,
            enquiries,
            enquiryRate: Math.round(enquiryRate * 100) / 100,
            leads,
            leadConversionRate: Math.round(leadConversionRate * 100) / 100,
            orders,
            orderConversionRate: Math.round(orderConversionRate * 100) / 100,
            totalOrderValue,
            topCities,
            topStates,
            peakHours,
            deviceBreakdown: deviceMap,
            sourceBreakdown: sourceMap,
            lastComputedAt: new Date(),
            ...relFields,
        };
        if (existing) {
            await this.mktPrisma.client.mktAnalyticsSummary.update({
                where: { id: existing.id },
                data: summaryData,
            });
        }
        else {
            await this.mktPrisma.client.mktAnalyticsSummary.create({
                data: { id: (0, crypto_1.randomUUID)(), ...summaryData },
            });
        }
        this.logger.log(`Summary computed for ${entityType}/${entityId}: impressions=${impressions}, ctr=${ctr.toFixed(2)}%`);
    }
};
exports.AnalyticsAggregatorProcessor = AnalyticsAggregatorProcessor;
__decorate([
    (0, bull_1.Process)('COMPUTE_SUMMARY'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsAggregatorProcessor.prototype, "handleComputeSummary", null);
exports.AnalyticsAggregatorProcessor = AnalyticsAggregatorProcessor = AnalyticsAggregatorProcessor_1 = __decorate([
    (0, bull_1.Processor)(exports.ANALYTICS_QUEUE),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], AnalyticsAggregatorProcessor);
//# sourceMappingURL=analytics-aggregator.processor.js.map