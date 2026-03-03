import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserActivityQuery } from './get-user-activity.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetUserActivityQuery)
export class GetUserActivityHandler implements IQueryHandler<GetUserActivityQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserActivityQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { performedById: query.userId };
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = query.dateFrom;
      if (query.dateTo) where.createdAt.lte = query.dateTo;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { fieldChanges: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      userId: query.userId,
      activity: logs.map(log => ({
        id: log.id,
        entityType: log.entityType,
        entityId: log.entityId,
        entityLabel: log.entityLabel,
        action: log.action,
        summary: log.summary,
        changeCount: log.changeCount,
        module: log.module,
        createdAt: log.createdAt.toISOString(),
      })),
      meta: { page, limit, total },
    };
  }
}
