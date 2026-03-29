import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPortalAnalyticsQuery } from './get-portal-analytics.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetPortalAnalyticsQuery)
export class GetPortalAnalyticsHandler implements IQueryHandler<GetPortalAnalyticsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPortalAnalyticsQuery) {
    const { tenantId, from, to } = query;
    const dateFilter = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };

    const [totalUsers, activeUsers, logs] = await Promise.all([
      this.prisma.identity.customerUser.count({
        where: { tenantId, isDeleted: false },
      }),
      this.prisma.identity.customerUser.count({
        where: { tenantId, isDeleted: false, isActive: true },
      }),
      this.prisma.identity.customerPortalLog.findMany({
        where: {
          tenantId,
          ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
        },
        select: { action: true, route: true, createdAt: true },
      }),
    ]);

    const loginCount = logs.filter((l) => l.action === 'LOGIN').length;

    const routeCounts = logs
      .filter((l) => l.route)
      .reduce(
        (acc, l) => {
          acc[l.route!] = (acc[l.route!] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

    const topPages = Object.entries(routeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([route, count]) => ({ route, count }));

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      loginCount,
      topPages,
      period: { from: from ?? null, to: to ?? null },
    };
  }
}
