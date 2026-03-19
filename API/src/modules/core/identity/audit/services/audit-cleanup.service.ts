import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { getErrorMessage } from '@/common/utils/error.utils';

const DEFAULT_RETENTION_DAYS = 730; // 2 years

@Injectable()
export class AuditCleanupService {
  private readonly logger = new Logger(AuditCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Called by cron-engine (AUDIT_LOG_CLEANUP). */
  async cleanupOldLogs(): Promise<{ totalDeleted: number }> {
    const policies = await this.prisma.auditRetentionPolicy.findMany({
      where: { isActive: true },
    });

    let totalDeleted = 0;

    for (const policy of policies) {
      const cutoff = new Date(Date.now() - policy.retentionDays * 86400000);
      try {
        // Delete field changes first (cascade should handle it but being explicit)
        await this.prisma.auditFieldChange.deleteMany({
          where: {
            auditLog: {
              entityType: policy.entityType,
              createdAt: { lt: cutoff },
            },
          },
        });

        const result = await this.prisma.auditLog.deleteMany({
          where: {
            entityType: policy.entityType,
            createdAt: { lt: cutoff },
          },
        });

        totalDeleted += result.count;
        if (result.count > 0) {
          this.logger.log(`Cleaned ${result.count} audit logs for ${policy.entityType} (older than ${cutoff.toISOString().split('T')[0]})`);
        }
      } catch (error) {
        this.logger.error(`Cleanup failed for ${policy.entityType}: ${getErrorMessage(error)}`);
      }
    }

    // Default cleanup for entity types without a policy
    const policyEntityTypes = policies.map(p => p.entityType);
    const defaultCutoff = new Date(Date.now() - DEFAULT_RETENTION_DAYS * 86400000);

    if (policyEntityTypes.length > 0) {
      const defaultResult = await this.prisma.auditLog.deleteMany({
        where: {
          entityType: { notIn: policyEntityTypes },
          createdAt: { lt: defaultCutoff },
        },
      });
      totalDeleted += defaultResult.count;
      if (defaultResult.count > 0) {
        this.logger.log(`Cleaned ${defaultResult.count} audit logs (default policy, older than ${defaultCutoff.toISOString().split('T')[0]})`);
      }
    }

    if (totalDeleted > 0) {
      this.logger.log(`Total cleaned: ${totalDeleted} audit logs`);
    }

    return { totalDeleted };
  }

  async getCleanupPreview(): Promise<Array<{ entityType: string; totalRecords: number; wouldDelete: number; retentionDays: number }>> {
    const policies = await this.prisma.auditRetentionPolicy.findMany({
      where: { isActive: true },
    });

    const preview: Array<{ entityType: string; totalRecords: number; wouldDelete: number; retentionDays: number }> = [];

    for (const policy of policies) {
      const cutoff = new Date(Date.now() - policy.retentionDays * 86400000);
      const [totalRecords, wouldDelete] = await Promise.all([
        this.prisma.auditLog.count({ where: { entityType: policy.entityType } }),
        this.prisma.auditLog.count({ where: { entityType: policy.entityType, createdAt: { lt: cutoff } } }),
      ]);
      preview.push({
        entityType: policy.entityType,
        totalRecords,
        wouldDelete,
        retentionDays: policy.retentionDays,
      });
    }

    return preview;
  }
}
