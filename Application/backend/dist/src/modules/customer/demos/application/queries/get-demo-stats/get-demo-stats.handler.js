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
var GetDemoStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDemoStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_demo_stats_query_1 = require("./get-demo-stats.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetDemoStatsHandler = GetDemoStatsHandler_1 = class GetDemoStatsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetDemoStatsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.userId)
                where.conductedById = query.userId;
            if (query.fromDate || query.toDate) {
                where.scheduledAt = {};
                if (query.fromDate)
                    where.scheduledAt.gte = new Date(query.fromDate);
                if (query.toDate)
                    where.scheduledAt.lte = new Date(query.toDate);
            }
            const [total, byStatus, byResult] = await Promise.all([
                this.prisma.working.demo.count({ where }),
                this.prisma.working.demo.groupBy({ by: ['status'], where, _count: true }),
                this.prisma.working.demo.groupBy({ by: ['result'], where: { ...where, result: { not: null } }, _count: true }),
            ]);
            return {
                total,
                byStatus: byStatus.map((g) => ({ status: g.status, count: g._count })),
                byResult: byResult.map((g) => ({ result: g.result, count: g._count })),
            };
        }
        catch (error) {
            this.logger.error(`GetDemoStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetDemoStatsHandler = GetDemoStatsHandler;
exports.GetDemoStatsHandler = GetDemoStatsHandler = GetDemoStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_demo_stats_query_1.GetDemoStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetDemoStatsHandler);
//# sourceMappingURL=get-demo-stats.handler.js.map