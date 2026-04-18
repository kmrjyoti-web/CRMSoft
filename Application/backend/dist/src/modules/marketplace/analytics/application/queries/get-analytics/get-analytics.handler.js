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
var GetAnalyticsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAnalyticsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_analytics_query_1 = require("./get-analytics.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let GetAnalyticsHandler = GetAnalyticsHandler_1 = class GetAnalyticsHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(GetAnalyticsHandler_1.name);
    }
    async execute(query) {
        try {
            const summary = await this.mktPrisma.client.mktAnalyticsSummary.findFirst({
                where: {
                    tenantId: query.tenantId,
                    entityType: query.entityType,
                    entityId: query.entityId,
                },
            });
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentEvents = await this.mktPrisma.client.mktAnalyticsEvent.groupBy({
                by: ['eventType'],
                where: {
                    tenantId: query.tenantId,
                    entityType: query.entityType,
                    entityId: query.entityId,
                    timestamp: { gte: since },
                },
                _count: { eventType: true },
            });
            const recentBreakdown = recentEvents.reduce((acc, row) => {
                acc[row.eventType] = row._count.eventType;
                return acc;
            }, {});
            return {
                summary,
                recentBreakdown,
                last24h: recentBreakdown,
            };
        }
        catch (error) {
            this.logger.error(`GetAnalyticsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetAnalyticsHandler = GetAnalyticsHandler;
exports.GetAnalyticsHandler = GetAnalyticsHandler = GetAnalyticsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_analytics_query_1.GetAnalyticsQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], GetAnalyticsHandler);
//# sourceMappingURL=get-analytics.handler.js.map