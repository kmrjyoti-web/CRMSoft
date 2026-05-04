import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetEntityTimelineQuery } from './get-entity-timeline.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { AuditSnapshotService } from '../../../services/audit-snapshot.service';

const ACTION_ICONS: Record<string, string> = {
  CREATE: '?', UPDATE: '??', DELETE: '???', STATUS_CHANGE: '??',
  SOFT_DELETE: '??', RESTORE: '??', BULK_UPDATE: '??', EXPORT: '??',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: '#10B981', UPDATE: '#3B82F6', DELETE: '#EF4444', STATUS_CHANGE: '#8B5CF6',
  SOFT_DELETE: '#F59E0B', RESTORE: '#06B6D4', BULK_UPDATE: '#EC4899', EXPORT: '#F97316',
};

@QueryHandler(GetEntityTimelineQuery)
export class GetEntityTimelineHandler implements IQueryHandler<GetEntityTimelineQuery> {
    private readonly logger = new Logger(GetEntityTimelineHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotService: AuditSnapshotService,
  ) {}

  async execute(query: GetEntityTimelineQuery) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {
        entityType: query.entityType,
        entityId: query.entityId,
      };
      if (query.action) where.action = query.action;
      if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) where.createdAt.gte = query.dateFrom;
        if (query.dateTo) where.createdAt.lte = query.dateTo;
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

      // Get current state
      const currentState = await this.snapshotService.captureSnapshot(query.entityType, query.entityId);
      const entityLabel = this.snapshotService.getEntityLabel(query.entityType, query.entityId, currentState);

      const now = Date.now();
      const timeline = logs.map(log => ({
        id: log.id,
        action: log.action,
        summary: log.summary,
        performedByName: log.performedByName,
        performedById: log.performedById,
        createdAt: log.createdAt.toISOString(),
        relativeTime: this.getRelativeTime(now, log.createdAt.getTime()),
        changeCount: log.changeCount,
        fieldChanges: log.fieldChanges.map(fc => ({
          fieldName: fc.fieldName,
          fieldLabel: fc.fieldLabel,
          oldValue: fc.oldValue,
          newValue: fc.newValue,
          oldDisplayValue: fc.oldDisplayValue,
          newDisplayValue: fc.newDisplayValue,
          fieldType: fc.fieldType,
        })),
        icon: ACTION_ICONS[log.action] || '??',
        color: ACTION_COLORS[log.action] || '#6B7280',
      }));

      return {
        entity: {
          type: query.entityType,
          id: query.entityId,
          label: entityLabel,
          currentState,
        },
        timeline,
        meta: { page, limit, total },
      };
    } catch (error) {
      this.logger.error(`GetEntityTimelineHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
}

  private getRelativeTime(now: number, then: number): string {
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}
