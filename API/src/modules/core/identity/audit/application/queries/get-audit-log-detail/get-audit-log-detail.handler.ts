import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetAuditLogDetailQuery } from './get-audit-log-detail.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@QueryHandler(GetAuditLogDetailQuery)
export class GetAuditLogDetailHandler implements IQueryHandler<GetAuditLogDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAuditLogDetailQuery) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id: query.id },
      include: { fieldChanges: { orderBy: { createdAt: 'asc' } } },
    });

    if (!log) throw new NotFoundException('Audit log not found');

    return {
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      entityLabel: log.entityLabel,
      action: log.action,
      summary: log.summary,
      changeCount: log.changeCount,
      beforeSnapshot: log.beforeSnapshot,
      afterSnapshot: log.afterSnapshot,
      performedById: log.performedById,
      performedByName: log.performedByName,
      performedByEmail: log.performedByEmail,
      performedByRole: log.performedByRole,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      httpMethod: log.httpMethod,
      requestUrl: log.requestUrl,
      source: log.source,
      module: log.module,
      correlationId: log.correlationId,
      tags: log.tags,
      isSensitive: log.isSensitive,
      isSystemAction: log.isSystemAction,
      createdAt: log.createdAt.toISOString(),
      fieldChanges: log.fieldChanges.map(fc => ({
        id: fc.id,
        fieldName: fc.fieldName,
        fieldLabel: fc.fieldLabel,
        fieldType: fc.fieldType,
        oldValue: fc.oldValue,
        newValue: fc.newValue,
        oldDisplayValue: fc.oldDisplayValue,
        newDisplayValue: fc.newDisplayValue,
        isSensitive: fc.isSensitive,
      })),
    };
  }
}
