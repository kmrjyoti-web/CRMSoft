import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuditStatsQuery } from './get-audit-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetAuditStatsQuery)
export class GetAuditStatsHandler implements IQueryHandler<GetAuditStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAuditStatsQuery) {
    const where: any = {};
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = query.dateFrom;
      if (query.dateTo) where.createdAt.lte = query.dateTo;
    }
    if (query.userId) where.performedById = query.userId;

    const [byAction, byEntity, totalChanges, sensitiveChanges, systemChanges] = await Promise.all([
      this.prisma.auditLog.groupBy({ by: ['action'], where, _count: true }),
      this.prisma.auditLog.groupBy({ by: ['entityType'], where, _count: true }),
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.count({ where: { ...where, isSensitive: true } }),
      this.prisma.auditLog.count({ where: { ...where, isSystemAction: true } }),
    ]);

    const actionMap: Record<string, number> = {};
    for (const a of byAction) actionMap[a.action] = a._count;

    const entityMap: Record<string, number> = {};
    for (const e of byEntity) entityMap[e.entityType] = e._count;

    // Top users
    const topUsers = await this.prisma.auditLog.groupBy({
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

    // Module breakdown
    const byModuleRaw = await this.prisma.auditLog.groupBy({
      by: ['module'],
      where: { ...where, module: { not: null } },
      _count: true,
    });
    const byModule: Record<string, number> = {};
    for (const m of byModuleRaw) if (m.module) byModule[m.module] = m._count;

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
}
