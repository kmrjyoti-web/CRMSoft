import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class BackupCron {
  private readonly logger = new Logger(BackupCron.name);

  constructor(private readonly backup: BackupService) {}

  /** Nightly 1 AM IST — backup all 4 schemas to R2 */
  @Cron('0 1 * * *', { timeZone: 'Asia/Kolkata' })
  async nightlyBackupAll() {
    this.logger.log('[CRON] Nightly backup started');
    if (!this.backup.isPgDumpAvailable()) {
      this.logger.warn('[CRON] pg_dump not available — skipping nightly backup');
      return;
    }
    try {
      const results = await this.backup.backupAllSchemas('cron');
      const succeeded = results.filter((r) => r.status === 'SUCCESS').length;
      const failed = results.filter((r) => r.status === 'FAILED').length;
      this.logger.log(`[CRON] Nightly backup done — success=${succeeded} failed=${failed}`);
      if (failed > 0) {
        const failures = results
          .filter((r) => r.status === 'FAILED')
          .map((r) => `${r.schemaName}: ${r.errorMessage}`)
          .join('; ');
        this.logger.error(`[CRON] Backup failures: ${failures}`);
      }
    } catch (err: any) {
      this.logger.error(`[CRON] Nightly backup crashed: ${err.message}`);
    }
  }

  /** Weekly Sunday 2 AM IST — cleanup expired backups from R2 */
  @Cron('0 2 * * 0', { timeZone: 'Asia/Kolkata' })
  async weeklyRetentionCleanup() {
    this.logger.log('[CRON] Weekly backup retention cleanup started');
    try {
      const result = await this.backup.cleanupExpiredBackups();
      this.logger.log(`[CRON] Retention cleanup done — deleted=${result.deleted}`);
    } catch (err: any) {
      this.logger.error(`[CRON] Retention cleanup failed: ${err.message}`);
    }
  }
}
