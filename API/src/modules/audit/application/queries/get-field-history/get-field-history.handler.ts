import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFieldHistoryQuery } from './get-field-history.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetFieldHistoryQuery)
export class GetFieldHistoryHandler implements IQueryHandler<GetFieldHistoryQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFieldHistoryQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [changes, total] = await Promise.all([
      this.prisma.auditFieldChange.findMany({
        where: {
          fieldName: query.fieldName,
          auditLog: { entityType: query.entityType as any, entityId: query.entityId },
        },
        include: {
          auditLog: { select: { id: true, action: true, performedByName: true, performedById: true, createdAt: true, summary: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditFieldChange.count({
        where: {
          fieldName: query.fieldName,
          auditLog: { entityType: query.entityType as any, entityId: query.entityId },
        },
      }),
    ]);

    return {
      entityType: query.entityType,
      entityId: query.entityId,
      fieldName: query.fieldName,
      history: changes.map(c => ({
        id: c.id,
        auditLogId: c.auditLogId,
        oldValue: c.oldValue,
        newValue: c.newValue,
        oldDisplayValue: c.oldDisplayValue,
        newDisplayValue: c.newDisplayValue,
        fieldType: c.fieldType,
        performedByName: c.auditLog.performedByName,
        performedById: c.auditLog.performedById,
        action: c.auditLog.action,
        createdAt: c.createdAt.toISOString(),
      })),
      meta: { page, limit, total },
    };
  }
}
