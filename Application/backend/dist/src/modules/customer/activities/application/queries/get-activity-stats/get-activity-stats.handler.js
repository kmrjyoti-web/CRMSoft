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
var GetActivityStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_activity_stats_query_1 = require("./get-activity-stats.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetActivityStatsHandler = GetActivityStatsHandler_1 = class GetActivityStatsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetActivityStatsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.userId)
                where.createdById = query.userId;
            if (query.fromDate || query.toDate) {
                where.createdAt = {};
                if (query.fromDate)
                    where.createdAt.gte = new Date(query.fromDate);
                if (query.toDate)
                    where.createdAt.lte = new Date(query.toDate);
            }
            const [total, completed, byType] = await Promise.all([
                this.prisma.working.activity.count({ where }),
                this.prisma.working.activity.count({ where: { ...where, completedAt: { not: null } } }),
                this.prisma.working.activity.groupBy({ by: ['type'], where, _count: true }),
            ]);
            return {
                total,
                completed,
                pending: total - completed,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                byType: byType.map((g) => ({ type: g.type, count: g._count })),
            };
        }
        catch (error) {
            this.logger.error(`GetActivityStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetActivityStatsHandler = GetActivityStatsHandler;
exports.GetActivityStatsHandler = GetActivityStatsHandler = GetActivityStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_activity_stats_query_1.GetActivityStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetActivityStatsHandler);
//# sourceMappingURL=get-activity-stats.handler.js.map