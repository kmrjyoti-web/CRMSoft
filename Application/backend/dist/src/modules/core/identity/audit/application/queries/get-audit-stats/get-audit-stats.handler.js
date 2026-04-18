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
var GetAuditStatsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuditStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_audit_stats_query_1 = require("./get-audit-stats.query");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let GetAuditStatsHandler = GetAuditStatsHandler_1 = class GetAuditStatsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetAuditStatsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.dateFrom || query.dateTo) {
                where.createdAt = {};
                if (query.dateFrom)
                    where.createdAt.gte = query.dateFrom;
                if (query.dateTo)
                    where.createdAt.lte = query.dateTo;
            }
            if (query.userId)
                where.performedById = query.userId;
            const [byAction, byEntity, totalChanges, sensitiveChanges, systemChanges] = await Promise.all([
                this.prisma.identity.auditLog.groupBy({ by: ['action'], where, _count: true }),
                this.prisma.identity.auditLog.groupBy({ by: ['entityType'], where, _count: true }),
                this.prisma.identity.auditLog.count({ where }),
                this.prisma.identity.auditLog.count({ where: { ...where, isSensitive: true } }),
                this.prisma.identity.auditLog.count({ where: { ...where, isSystemAction: true } }),
            ]);
            const actionMap = {};
            for (const a of byAction)
                actionMap[a.action] = a._count;
            const entityMap = {};
            for (const e of byEntity)
                entityMap[e.entityType] = e._count;
            const topUsers = await this.prisma.identity.auditLog.groupBy({
                by: ['performedById', 'performedByName'],
                where: { ...where, performedById: { not: null } },
                _count: true,
                orderBy: { _count: { performedById: 'desc' } },
                take: 10,
            });
            const byUser = topUsers.map(u => ({
                userId: u.performedById,
                name: u.performedByName || 'Unknown',
                changes: u._count,
            }));
            const byModuleRaw = await this.prisma.identity.auditLog.groupBy({
                by: ['module'],
                where: { ...where, module: { not: null } },
                _count: true,
            });
            const byModule = {};
            for (const m of byModuleRaw)
                if (m.module)
                    byModule[m.module] = m._count;
            return {
                totalChanges,
                byAction: actionMap,
                byEntity: entityMap,
                byUser,
                byModule,
                sensitiveChanges,
                systemChanges,
            };
        }
        catch (error) {
            this.logger.error(`GetAuditStatsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetAuditStatsHandler = GetAuditStatsHandler;
exports.GetAuditStatsHandler = GetAuditStatsHandler = GetAuditStatsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_audit_stats_query_1.GetAuditStatsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetAuditStatsHandler);
//# sourceMappingURL=get-audit-stats.handler.js.map