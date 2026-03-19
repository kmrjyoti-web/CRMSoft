import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { DataRetentionPolicy, RetentionAction } from '@prisma/identity-client';
import { AppError } from '../../../../../common/errors/app-error';

export interface RetentionResult {
  entityName: string;
  action: RetentionAction;
  recordsAffected: number;
  skipped: boolean;
  reason?: string;
}

/** Maps entity names to Prisma delegate names. */
const ENTITY_MAP: Record<string, string> = {
  Lead: 'lead',
  Activity: 'activity',
  Notification: 'notification',
  AuditLog: 'auditLog',
  ErrorLog: 'errorLog',
  SyncChangeLog: 'syncChangeLog',
  CronJobRunLog: 'cronJobRunLog',
};

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get all retention policies for a tenant. */
  async getAll(tenantId: string): Promise<DataRetentionPolicy[]> {
    return this.prisma.dataRetentionPolicy.findMany({ where: { tenantId } });
  }

  /** Update a retention policy. */
  async update(tenantId: string, entityName: string, data: Record<string, any>): Promise<DataRetentionPolicy> {
    const policy = await this.prisma.dataRetentionPolicy.findUnique({
      where: { tenantId_entityName: { tenantId, entityName } },
    });
    if (!policy) throw AppError.from('NOT_FOUND');
    const { scopeFilter, ...rest } = data;
    const updateData: any = { ...rest };
    if (scopeFilter !== undefined) updateData.scopeFilter = scopeFilter;
    return this.prisma.dataRetentionPolicy.update({ where: { id: policy.id }, data: updateData });
  }

  /** Preview what would be affected by retention (dry run). */
  async preview(tenantId: string, entityName: string): Promise<{
    recordCount: number; oldestRecord: Date | null; action: RetentionAction;
  }> {
    const policy = await this.prisma.dataRetentionPolicy.findUnique({
      where: { tenantId_entityName: { tenantId, entityName } },
    });
    if (!policy) throw AppError.from('NOT_FOUND');

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - policy.retentionDays);
    const delegate = (this.prisma as any)[ENTITY_MAP[entityName]];
    if (!delegate) return { recordCount: 0, oldestRecord: null, action: policy.action };

    const where = this.buildWhere(tenantId, cutoff, policy.scopeFilter as any);
    const count = await delegate.count({ where });
    const oldest = await delegate.findFirst({ where, orderBy: { createdAt: 'asc' }, select: { createdAt: true } });

    return { recordCount: count, oldestRecord: oldest?.createdAt ?? null, action: policy.action };
  }

  /** Execute retention policies for a tenant (called by CRON). */
  async execute(tenantId: string): Promise<RetentionResult[]> {
    const policies = await this.prisma.dataRetentionPolicy.findMany({
      where: { tenantId, isEnabled: true },
    });
    const results: RetentionResult[] = [];

    for (const policy of policies) {
      const delegate = (this.prisma as any)[ENTITY_MAP[policy.entityName]];
      if (!delegate) {
        results.push({ entityName: policy.entityName, action: policy.action, recordsAffected: 0, skipped: true, reason: 'Unknown entity' });
        continue;
      }
      if (policy.requireApproval) {
        results.push({ entityName: policy.entityName, action: policy.action, recordsAffected: 0, skipped: true, reason: 'Requires approval' });
        continue;
      }

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - policy.retentionDays);
      const where = this.buildWhere(tenantId, cutoff, policy.scopeFilter as any);

      let affected = 0;
      try {
        if (policy.action === 'HARD_DELETE') {
          const result = await delegate.deleteMany({ where });
          affected = result.count;
        } else {
          // ARCHIVE, SOFT_DELETE, ANONYMIZE — use updateMany
          const updateData = policy.action === 'ANONYMIZE'
            ? { email: '***', phone: '***', name: '***' }
            : {};
          const result = await delegate.updateMany({ where, data: updateData });
          affected = result.count;
        }
      } catch (err) {
        this.logger.error(`Retention failed for ${policy.entityName}: ${(err as Error).message}`);
      }

      await this.prisma.dataRetentionPolicy.update({
        where: { id: policy.id },
        data: { lastExecutedAt: new Date(), lastRecordsAffected: affected },
      });
      results.push({ entityName: policy.entityName, action: policy.action, recordsAffected: affected, skipped: false });
    }

    return results;
  }

  private buildWhere(tenantId: string, cutoff: Date, scopeFilter?: Record<string, any>): any {
    const where: any = { tenantId, createdAt: { lt: cutoff } };
    if (scopeFilter) Object.assign(where, scopeFilter);
    return where;
  }
}
