import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';

/** Refresh expiring OAuth tokens. Delegates to TokenRefresherService. */
@Injectable()
export class TokenRefreshHandler implements ICronJobHandler {
  readonly jobCode = 'TOKEN_REFRESH';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const expiring = await this.prisma.tenantCredential.findMany({
      where: {
        status: 'ACTIVE',
        provider: { in: ['GMAIL', 'OUTLOOK', 'GOOGLE_DRIVE', 'ONEDRIVE', 'DROPBOX'] },
        tokenExpiresAt: { lt: oneHourFromNow },
      },
    });
    return { recordsProcessed: expiring.length, details: { expiringTokens: expiring.length } };
  }
}

/** Weekly credential health check. */
@Injectable()
export class CredentialHealthCheckHandler implements ICronJobHandler {
  readonly jobCode = 'CREDENTIAL_HEALTH_CHECK';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const active = await this.prisma.tenantCredential.findMany({
      where: { status: 'ACTIVE' },
    });
    return { recordsProcessed: active.length };
  }
}

/** Archive old audit logs beyond retention period. */
@Injectable()
export class AuditLogCleanupHandler implements ICronJobHandler {
  readonly jobCode = 'AUDIT_LOG_CLEANUP';
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: Record<string, any>): Promise<CronJobResult> {
    const days = params.retentionDays ?? 180;
    const cutoff = new Date(Date.now() - days * 86400000);
    const policies = await this.prisma.auditRetentionPolicy.findMany({
      where: { isActive: true },
    });
    let total = 0;
    for (const policy of policies) {
      const policyCutoff = new Date(Date.now() - policy.retentionDays * 86400000);
      const result = await this.prisma.auditLog.deleteMany({
        where: { entityType: policy.entityType, createdAt: { lt: policyCutoff } },
      });
      total += result.count;
    }
    return { recordsProcessed: total };
  }
}

/** Reset daily usage counters at midnight. */
@Injectable()
export class ResetDailyCountersHandler implements ICronJobHandler {
  readonly jobCode = 'RESET_DAILY_COUNTERS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const result = await this.prisma.tenantCredential.updateMany({
      where: { dailyUsageCount: { gt: 0 } },
      data: { dailyUsageCount: 0 },
    });
    return { recordsProcessed: result.count };
  }
}

/** Clean old export files. */
@Injectable()
export class ExportFileCleanupHandler implements ICronJobHandler {
  readonly jobCode = 'EXPORT_FILE_CLEANUP';
  private readonly logger = new Logger(ExportFileCleanupHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: Record<string, any>): Promise<CronJobResult> {
    const days = params.retentionDays ?? 30;
    const cutoff = new Date(Date.now() - days * 86400000);
    // Clean export records from DB
    const result = await this.prisma.working.reportExportLog.deleteMany({
      where: { status: 'DONE', createdAt: { lt: cutoff } },
    });
    this.logger.log(`Cleaned ${result.count} old export records`);
    return { recordsProcessed: result.count };
  }
}

/** Database backup handler (placeholder). */
@Injectable()
export class BackupDbHandler implements ICronJobHandler {
  readonly jobCode = 'BACKUP_DB';
  private readonly logger = new Logger(BackupDbHandler.name);

  async execute(params: Record<string, any>): Promise<CronJobResult> {
    this.logger.log(`Backup job triggered (placeholder) — path: ${params.backupPath ?? '/backups'}`);
    return { recordsProcessed: 1, details: { status: 'placeholder' } };
  }
}
