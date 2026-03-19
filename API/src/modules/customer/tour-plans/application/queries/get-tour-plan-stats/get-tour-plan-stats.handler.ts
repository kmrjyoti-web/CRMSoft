import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTourPlanStatsQuery } from './get-tour-plan-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTourPlanStatsQuery)
export class GetTourPlanStatsHandler implements IQueryHandler<GetTourPlanStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTourPlanStatsQuery) {
    const where: any = {};
    if (query.userId) where.salesPersonId = query.userId;
    if (query.fromDate || query.toDate) {
      where.planDate = {};
      if (query.fromDate) where.planDate.gte = new Date(query.fromDate);
      if (query.toDate) where.planDate.lte = new Date(query.toDate);
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
}
