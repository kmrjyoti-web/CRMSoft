import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetGlobalFeedQuery } from './get-global-feed.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetGlobalFeedQuery)
export class GetGlobalFeedHandler implements IQueryHandler<GetGlobalFeedQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetGlobalFeedQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.action) where.action = query.action;
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
      feed: logs.map(log => ({
        id: log.id,
        entityType: log.entityType,
        entityId: log.entityId,
        entityLabel: log.entityLabel,
        action: log.action,
        summary: log.summary,
        changeCount: log.changeCount,
        performedByName: log.performedByName,
        performedById: log.performedById,
        source: log.source,
        module: log.module,
        createdAt: log.createdAt.toISOString(),
        fieldChanges: log.fieldChanges.map(fc => ({
          fieldName: fc.fieldName,
          fieldLabel: fc.fieldLabel,
          oldDisplayValue: fc.oldDisplayValue,
          newDisplayValue: fc.newDisplayValue,
        })),
      })),
      meta: { page, limit, total },
    };
  }
}
