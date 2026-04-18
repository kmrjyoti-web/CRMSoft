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
var GetTourPlanStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTourPlanStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_tour_plan_stats_query_1 = require("./get-tour-plan-stats.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetTourPlanStatsHandler = GetTourPlanStatsHandler_1 = class GetTourPlanStatsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTourPlanStatsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.userId)
                where.salesPersonId = query.userId;
            if (query.fromDate || query.toDate) {
                where.planDate = {};
                if (query.fromDate)
                    where.planDate.gte = new Date(query.fromDate);
                if (query.toDate)
                    where.planDate.lte = new Date(query.toDate);
            }
            const [total, byStatus, totalVisits, completedVisits] = await Promise.all([
                this.prisma.working.tourPlan.count({ where }),
                this.prisma.working.tourPlan.groupBy({ by: ['status'], where, _count: true }),
                this.prisma.working.tourPlanVisit.count({ where: { tourPlan: where } }),
                this.prisma.working.tourPlanVisit.count({ where: { tourPlan: where, isCompleted: true } }),
            ]);
            return {
                total,
                byStatus: byStatus.map((g) => ({ status: g.status, count: g._count })),
                totalVisits,
                completedVisits,
                visitCompletionRate: totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0,
            };
        }
        catch (error) {
            this.logger.error(`GetTourPlanStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTourPlanStatsHandler = GetTourPlanStatsHandler;
exports.GetTourPlanStatsHandler = GetTourPlanStatsHandler = GetTourPlanStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_tour_plan_stats_query_1.GetTourPlanStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTourPlanStatsHandler);
//# sourceMappingURL=get-tour-plan-stats.handler.js.map