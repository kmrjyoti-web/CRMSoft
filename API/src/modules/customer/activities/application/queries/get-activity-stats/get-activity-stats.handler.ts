import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetActivityStatsQuery } from './get-activity-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetActivityStatsQuery)
export class GetActivityStatsHandler implements IQueryHandler<GetActivityStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetActivityStatsQuery) {
    const where: any = {};
    if (query.userId) where.createdById = query.userId;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
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
}
