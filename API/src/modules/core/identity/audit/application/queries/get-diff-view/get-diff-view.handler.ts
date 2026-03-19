import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetDiffViewQuery } from './get-diff-view.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@QueryHandler(GetDiffViewQuery)
export class GetDiffViewHandler implements IQueryHandler<GetDiffViewQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDiffViewQuery) {
    const log = await this.prisma.identity.auditLog.findUnique({
      where: { id: query.id },
      include: { fieldChanges: { orderBy: { createdAt: 'asc' } } },
    });

    if (!log) throw new NotFoundException('Audit log not found');

    const before = (log.beforeSnapshot as Record<string, any>) || {};
    const after = (log.afterSnapshot as Record<string, any>) || {};
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const changedFieldNames = new Set(log.fieldChanges.map(fc => fc.fieldName));

    const fields = log.fieldChanges.map(fc => {
      let changeType: 'ADDED' | 'MODIFIED' | 'REMOVED' = 'MODIFIED';
      if (fc.oldValue === null && fc.newValue !== null) changeType = 'ADDED';
      else if (fc.oldValue !== null && fc.newValue === null) changeType = 'REMOVED';

      return {
        fieldName: fc.fieldName,
        fieldLabel: fc.fieldLabel,
        before: { value: fc.oldValue, display: fc.oldDisplayValue || '—' },
        after: { value: fc.newValue, display: fc.newDisplayValue || '—' },
        changeType,
      };
    });

    const unchangedFieldCount = allKeys.size - changedFieldNames.size;

    return {
      auditLog: {
        id: log.id,
        action: log.action,
        summary: log.summary,
        performedByName: log.performedByName,
        createdAt: log.createdAt.toISOString(),
      },
      diff: {
        format: 'side_by_side',
        fields,
        unchangedFieldCount: Math.max(0, unchangedFieldCount),
      },
    };
  }
}
