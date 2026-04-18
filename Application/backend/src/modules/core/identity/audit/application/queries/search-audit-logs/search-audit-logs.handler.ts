import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SearchAuditLogsQuery } from './search-audit-logs.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@QueryHandler(SearchAuditLogsQuery)
export class SearchAuditLogsHandler implements IQueryHandler<SearchAuditLogsQuery> {
    private readonly logger = new Logger(SearchAuditLogsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: SearchAuditLogsQuery) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (query.q) {
        where.OR = [
          { summary: { contains: query.q, mode: 'insensitive' } },
          { entityLabel: { contains: query.q, mode: 'insensitive' } },
          { fieldChanges: { some: { OR: [
            { oldValue: { contains: query.q, mode: 'insensitive' } },
            { newValue: { contains: query.q, mode: 'insensitive' } },
          ] } } },
        ];
      }

      if (query.entityType) where.entityType = query.entityType;
      if (query.action) where.action = query.action;
      if (query.userId) where.performedById = query.userId;
      if (query.module) where.module = query.module;
      if (query.sensitive !== undefined) where.isSensitive = query.sensitive;

      if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) where.createdAt.gte = query.dateFrom;
        if (query.dateTo) where.createdAt.lte = query.dateTo;
      }

      if (query.field) {
        where.fieldChanges = { some: { fieldName: query.field } };
      }

      const [logs, total] = await Promise.all([
        this.prisma.identity.auditLog.findMany({
          where,
          include: { fieldChanges: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.identity.auditLog.count({ where }),
      ]);

      return {
        results: logs.map(log => ({
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
          isSensitive: log.isSensitive,
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
    } catch (error) {
      this.logger.error(`SearchAuditLogsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
