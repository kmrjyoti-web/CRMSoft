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
var GetFollowUpStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFollowUpStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_follow_up_stats_query_1 = require("./get-follow-up-stats.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetFollowUpStatsHandler = GetFollowUpStatsHandler_1 = class GetFollowUpStatsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetFollowUpStatsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { isActive: true };
            if (query.userId)
                where.assignedToId = query.userId;
            if (query.fromDate || query.toDate) {
                where.dueDate = {};
                if (query.fromDate)
                    where.dueDate.gte = new Date(query.fromDate);
                if (query.toDate)
                    where.dueDate.lte = new Date(query.toDate);
            }
            const [total, completed, overdue, byPriority] = await Promise.all([
                this.prisma.working.followUp.count({ where }),
                this.prisma.working.followUp.count({ where: { ...where, completedAt: { not: null } } }),
                this.prisma.working.followUp.count({ where: { ...where, isOverdue: true, completedAt: null } }),
                this.prisma.working.followUp.groupBy({ by: ['priority'], where, _count: true }),
            ]);
            return {
                total,
                completed,
                overdue,
                pending: total - completed,
                byPriority: byPriority.map((g) => ({ priority: g.priority, count: g._count })),
            };
        }
        catch (error) {
            this.logger.error(`GetFollowUpStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetFollowUpStatsHandler = GetFollowUpStatsHandler;
exports.GetFollowUpStatsHandler = GetFollowUpStatsHandler = GetFollowUpStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_follow_up_stats_query_1.GetFollowUpStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetFollowUpStatsHandler);
//# sourceMappingURL=get-follow-up-stats.handler.js.map