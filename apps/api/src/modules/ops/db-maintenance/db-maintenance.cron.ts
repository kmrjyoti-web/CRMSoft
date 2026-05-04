import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DbMaintenanceService } from './db-maintenance.service';

@Injectable()
export class DbMaintenanceCron {
  private readonly logger = new Logger(DbMaintenanceCron.name);

  constructor(private readonly maintenance: DbMaintenanceService) {}

  /** Nightly 2 AM IST — VACUUM ANALYZE all tables + dev/session log cleanup */
  @Cron('0 2 * * *', { timeZone: 'Asia/Kolkata' })
  async nightlyMaintenance() {
    this.logger.log('[CRON] Nightly maintenance started');
    try {
      const [vacuumResult, devLogs, sessions] = await Promise.allSettled([
        this.maintenance.runVacuum(),
        this.maintenance.cleanupDevLogs(),
        this.maintenance.cleanupExpiredSessions(),
      ]);
      this.logger.log(
        `[CRON] Nightly done — vacuum=${this.statusOf(vacuumResult)} devLogs=${this.countOf(devLogs)} sessions=${this.countOf(sessions)}`,
      );
    } catch (err: any) {
      this.logger.error(`[CRON] Nightly maintenance failed: ${err.message}`);
    }
  }

  /** Weekly Sunday 3 AM IST — VACUUM FULL + ANALYZE (heavier, compacts storage) */
  @Cron('0 3 * * 0', { timeZone: 'Asia/Kolkata' })
  async weeklyDeepVacuum() {
    this.logger.log('[CRON] Weekly deep vacuum started');
    try {
      const result = await this.maintenance.runVacuum(undefined, true);
      this.logger.log(
        `[CRON] Weekly vacuum FULL done in ${result.duration}ms — success=${result.success}`,
      );
    } catch (err: any) {
      this.logger.error(`[CRON] Weekly vacuum failed: ${err.message}`);
    }
  }

  /** Monthly 1st day 4 AM IST — full audit + error log cleanup */
  @Cron('0 4 1 * *', { timeZone: 'Asia/Kolkata' })
  async monthlyAuditCleanup() {
    this.logger.log('[CRON] Monthly audit cleanup started');
    try {
      const results = await this.maintenance.runAllCleanup();
      const summary = results.map((r) => `${r.type}=${r.deleted}`).join(' ');
      this.logger.log(`[CRON] Monthly cleanup done — ${summary}`);
    } catch (err: any) {
      this.logger.error(`[CRON] Monthly cleanup failed: ${err.message}`);
    }
  }

  private statusOf(result: PromiseSettledResult<any>): string {
    return result.status === 'fulfilled' ? (result.value?.success ? 'ok' : 'failed') : 'error';
  }

  private countOf(result: PromiseSettledResult<any>): number {
    return result.status === 'fulfilled' ? (result.value?.deleted ?? 0) : -1;
  }
}
