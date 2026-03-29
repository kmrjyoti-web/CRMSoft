import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { AuditDiffService, FieldChange } from './audit-diff.service';
import { AuditSnapshotService } from './audit-snapshot.service';
import { AuditSummaryGeneratorService } from './audit-summary-generator.service';
import { AuditSanitizerService } from './audit-sanitizer.service';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class AuditCoreService {
  private readonly logger = new Logger(AuditCoreService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly diffService: AuditDiffService,
    private readonly snapshotService: AuditSnapshotService,
    private readonly summaryGenerator: AuditSummaryGeneratorService,
    private readonly sanitizer: AuditSanitizerService,
  ) {}

  async log(params: {
    tenantId?: string;
    entityType: string;
    entityId: string;
    action: string;
    beforeSnapshot?: any;
    afterSnapshot?: any;
    performedById?: string;
    performedByName?: string;
    performedByEmail?: string;
    performedByRole?: string;
    ipAddress?: string;
    userAgent?: string;
    httpMethod?: string;
    requestUrl?: string;
    requestBody?: any;
    source?: string;
    module?: string;
    correlationId?: string;
    summary?: string;
    tags?: string[];
  }) {
    try {
      if (!params.entityId) return null;

      // Sanitize
      const sanitizedBody = params.requestBody ? this.sanitizer.sanitize(params.requestBody) : null;
      const sanitizedBefore = params.beforeSnapshot ? this.sanitizer.sanitizeSnapshot(params.beforeSnapshot, params.entityType) : null;
      const sanitizedAfter = params.afterSnapshot ? this.sanitizer.sanitizeSnapshot(params.afterSnapshot, params.entityType) : null;

      // Compute diff
      const fieldChanges = this.diffService.computeDiff(sanitizedBefore, sanitizedAfter, params.entityType);

      // Entity label
      const entityLabel = this.snapshotService.getEntityLabel(
        params.entityType, params.entityId, sanitizedAfter || sanitizedBefore,
      );

      // Summary
      const summary = params.summary || this.summaryGenerator.generateSummary({
        action: params.action,
        entityType: params.entityType,
        entityLabel,
        performedByName: params.performedByName || 'System',
        fieldChanges,
      });

      const isSensitive = fieldChanges.some(fc => fc.isSensitive);
      const isSystemAction = params.source === 'CRON' || params.source === 'WORKFLOW' || params.source === 'SYSTEM';

      const auditLog = await this.prisma.identity.auditLog.create({
        data: {
          tenantId: params.tenantId || '',
          entityType: params.entityType as any,
          entityId: params.entityId,
          entityLabel,
          action: params.action as any,
          summary,
          changeCount: fieldChanges.length,
          beforeSnapshot: sanitizedBefore || undefined,
          afterSnapshot: sanitizedAfter || undefined,
          performedById: params.performedById,
          performedByName: params.performedByName,
          performedByEmail: params.performedByEmail,
          performedByRole: params.performedByRole,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent ? params.userAgent.substring(0, 500) : null,
          httpMethod: params.httpMethod,
          requestUrl: params.requestUrl,
          requestBody: sanitizedBody || undefined,
          source: params.source,
          module: params.module,
          correlationId: params.correlationId,
          tags: params.tags || [],
          isSensitive,
          isSystemAction,
          fieldChanges: fieldChanges.length > 0 ? {
            createMany: {
              data: fieldChanges.map(fc => ({
                fieldName: fc.fieldName,
                fieldLabel: fc.fieldLabel,
                fieldType: fc.fieldType,
                oldValue: fc.isSensitive ? '[REDACTED]' : fc.oldValue,
                newValue: fc.isSensitive ? '[REDACTED]' : fc.newValue,
                oldDisplayValue: fc.isSensitive ? '[REDACTED]' : fc.oldDisplayValue,
                newDisplayValue: fc.isSensitive ? '[REDACTED]' : fc.newDisplayValue,
                isSensitive: fc.isSensitive,
              })),
            },
          } : undefined,
        },
      });

      return auditLog;
    } catch (error) {
      this.logger.error(`Audit log failed: ${getErrorMessage(error)}`, (error as Error).stack);
      return null;
    }
  }

  async logAction(params: {
    entityType: string;
    entityId: string;
    action: string;
    summary: string;
    source: string;
    module?: string;
    performedById?: string;
    performedByName?: string;
    changes?: Array<{ field: string; oldValue?: string; newValue?: string }>;
    correlationId?: string;
    tags?: string[];
  }) {
    try {
      const fieldChanges = (params.changes || []).map(c => ({
        fieldName: c.field,
        fieldLabel: c.field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
        fieldType: 'STRING',
        oldValue: c.oldValue || null,
        newValue: c.newValue || null,
        oldDisplayValue: c.oldValue || '—',
        newDisplayValue: c.newValue || '—',
        isSensitive: this.sanitizer.isSensitive(c.field),
      }));

      const auditLog = await this.prisma.identity.auditLog.create({
        data: {
          entityType: params.entityType as any,
          entityId: params.entityId,
          entityLabel: `${params.entityType} ${params.entityId.substring(0, 8)}`,
          action: params.action as any,
          summary: params.summary,
          changeCount: fieldChanges.length,
          performedById: params.performedById,
          performedByName: params.performedByName || 'System',
          source: params.source,
          module: params.module,
          correlationId: params.correlationId,
          tags: params.tags || [],
          isSystemAction: params.source !== 'API',
          fieldChanges: fieldChanges.length > 0 ? {
            createMany: { data: fieldChanges },
          } : undefined,
        },
      });

      return auditLog;
    } catch (error) {
      this.logger.error(`Audit logAction failed: ${getErrorMessage(error)}`);
      return null;
    }
  }
}
