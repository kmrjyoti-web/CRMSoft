import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDemoStatsQuery } from './get-demo-stats.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetDemoStatsQuery)
export class GetDemoStatsHandler implements IQueryHandler<GetDemoStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDemoStatsQuery) {
    const where: any = {};
    if (query.userId) where.conductedById = query.userId;
    if (query.fromDate || query.toDate) {
      where.scheduledAt = {};
      if (query.fromDate) where.scheduledAt.gte = new Date(query.fromDate);
      if (query.toDate) where.scheduledAt.lte = new Date(query.toDate);
    }

    const [total, byStatus, byResult] = await Promise.all([
      this.prisma.demo.count({ where }),
      this.prisma.demo.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.demo.groupBy({ by: ['result'], where: { ...where, result: { not: null } }, _count: true }),
    ]);

    return {
      total,
      byStatus: byStatus.map((g) => ({ status: g.status, count: g._count })),
      byResult: byResult.map((g) => ({ result: g.result, count: g._count })),
    };
  }
}
