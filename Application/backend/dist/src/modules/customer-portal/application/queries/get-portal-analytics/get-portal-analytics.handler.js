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
var GetPortalAnalyticsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPortalAnalyticsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_portal_analytics_query_1 = require("./get-portal-analytics.query");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let GetPortalAnalyticsHandler = GetPortalAnalyticsHandler_1 = class GetPortalAnalyticsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetPortalAnalyticsHandler_1.name);
    }
    async execute(query) {
        try {
            const { tenantId, from, to } = query;
            const dateFilter = {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
            };
            const [totalUsers, activeUsers, logs] = await Promise.all([
                this.prisma.identity.customerUser.count({
                    where: { tenantId, isDeleted: false },
                }),
                this.prisma.identity.customerUser.count({
                    where: { tenantId, isDeleted: false, isActive: true },
                }),
                this.prisma.identity.customerPortalLog.findMany({
                    where: {
                        tenantId,
                        ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
                    },
                    select: { action: true, route: true, createdAt: true },
                }),
            ]);
            const loginCount = logs.filter((l) => l.action === 'LOGIN').length;
            const routeCounts = logs
                .filter((l) => l.route)
                .reduce((acc, l) => {
                acc[l.route] = (acc[l.route] ?? 0) + 1;
                return acc;
            }, {});
            const topPages = Object.entries(routeCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([route, count]) => ({ route, count }));
            return {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                loginCount,
                topPages,
                period: { from: from ?? null, to: to ?? null },
            };
        }
        catch (error) {
            this.logger.error(`GetPortalAnalyticsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetPortalAnalyticsHandler = GetPortalAnalyticsHandler;
exports.GetPortalAnalyticsHandler = GetPortalAnalyticsHandler = GetPortalAnalyticsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_portal_analytics_query_1.GetPortalAnalyticsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetPortalAnalyticsHandler);
//# sourceMappingURL=get-portal-analytics.handler.js.map