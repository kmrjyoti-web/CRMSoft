import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetFollowUpStatsQuery } from './get-follow-up-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetFollowUpStatsQuery)
export class GetFollowUpStatsHandler implements IQueryHandler<GetFollowUpStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFollowUpStatsQuery) {
    const where: any = { isActive: true };
    if (query.userId) where.assignedToId = query.userId;
    if (query.fromDate || query.toDate) {
      where.dueDate = {};
      if (query.fromDate) where.dueDate.gte = new Date(query.fromDate);
      if (query.toDate) where.dueDate.lte = new Date(query.toDate);
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
}
