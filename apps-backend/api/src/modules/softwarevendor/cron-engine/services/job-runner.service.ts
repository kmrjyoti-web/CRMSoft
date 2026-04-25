import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CronJobConfig, CronJobRunLog, CronRunStatus } from '@prisma/working-client';
import { JobRegistryService } from './job-registry.service';
import { CronParserService } from './cron-parser.service';
import { CronAlertService } from './cron-alert.service';
import { Decimal } from 'decimal.js';
import { getErrorMessage } from '@/common/utils/error.utils';

/**
 * Executes a cron job with full lifecycle:
 * lock ? run ? log ? retry ? alert ? unlock.
 */
@Injectable()
export class JobRunnerService {
  private readonly logger = new Logger(JobRunnerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: JobRegistryService,
    private readonly parser: CronParserService,
    private readonly alert: CronAlertService,
  ) {}

  /** Execute a cron job with locking, logging, and retry. */
  async run(
    jobCode: string,
    triggeredBy = 'SCHEDULER',
    retryAttempt = 0,
  ): Promise<CronJobRunLog | null> {
    const job = await this.prisma.working.cronJobConfig.findUnique({
      where: { jobCode },
    });
    if (!job) {
      this.logger.warn(`Job not found: ${jobCode}`);
      return null;
    }

    // Concurrency check
    if (!job.allowConcurrent && job.isRunning) {
      return this.logSkipped(job, triggeredBy);
    }

    // Acquire lock
    await this.prisma.working.cronJobConfig.update({
      where: { id: job.id },
      data: { isRunning: true },
    });

    const startedAt = new Date();
    const runLog = await this.prisma.working.cronJobRunLog.create({
      data: {
        jobId: job.id,
        jobCode,
        startedAt,
        status: 'RUNNING',
        retryAttempt,
        triggeredBy,
      },
    });

    try {
      const result = await this.executeWithTimeout(job);
      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();

      const updated = await this.prisma.working.cronJobRunLog.update({
        where: { id: runLog.id },
        data: {
          status: 'SUCCESS',
          finishedAt,
          durationMs,
          recordsProcessed: result.recordsProcessed,
          recordsSucceeded: result.recordsSucceeded,
          recordsFailed: result.recordsFailed,
          details: result.details as any,
        },
      });

      await this.updateJobSuccess(job, durationMs, result.recordsProcessed);
      return updated;
    } catch (err) {
      return this.handleFailure(job, runLog, err, triggeredBy, retryAttempt);
    } finally {
      await this.prisma.working.cronJobConfig.update({
        where: { id: job.id },
        data: { isRunning: false },
      });
    }
  }

  private async executeWithTimeout(job: CronJobConfig): Promise<any> {
    const handler = this.registry.getHandler(job.jobCode);
    if (!handler) throw new Error(`No handler registered for ${job.jobCode}`);

    const params = (job.jobParams as Record<string, any>) ?? {};
    const timeoutMs = job.timeoutSeconds * 1000;

    if (job.scope === 'TENANT') {
      return this.executeForAllTenants(handler, params, timeoutMs);
    }

    return Promise.race([
      handler.execute(params),
      this.timeout(timeoutMs, job.jobCode),
    ]);
  }

  private async executeForAllTenants(
    handler: any,
    params: Record<string, any>,
    timeoutMs: number,
  ): Promise<Record<string, unknown>> {
    const tenants = await this.prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    let processed = 0, succeeded = 0, failed = 0;
    for (const tenant of tenants) {
      try {
        const r = await Promise.race([
          handler.execute(params, { tenantId: tenant.id }),
          this.timeout(timeoutMs, handler.jobCode),
        ]);
        processed += r.recordsProcessed ?? 0;
        succeeded += r.recordsSucceeded ?? 0;
        failed += r.recordsFailed ?? 0;
      } catch (err) {
        failed++;
        this.logger.error(`${handler.jobCode} failed for tenant ${tenant.id}: ${getErrorMessage(err)}`);
      }
    }
    return { recordsProcessed: processed, recordsSucceeded: succeeded, recordsFailed: failed };
  }

  private timeout(ms: number, jobCode: string): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT: ${jobCode} exceeded ${ms}ms`)), ms),
    );
  }

  private async handleFailure(
    job: CronJobConfig,
    runLog: CronJobRunLog,
    err: any,
    triggeredBy: string,
    retryAttempt: number,
  ): Promise<CronJobRunLog> {
    const isTimeout = getErrorMessage(err)?.startsWith('TIMEOUT:');
    const status: CronRunStatus = isTimeout ? 'TIMEOUT' : 'FAILED';
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - runLog.startedAt.getTime();

    const updated = await this.prisma.working.cronJobRunLog.update({
      where: { id: runLog.id },
      data: {
        status,
        finishedAt,
        durationMs,
        errorMessage: getErrorMessage(err),
        errorStack: err.stack?.slice(0, 2000),
      },
    });

    const newConsec = job.consecutiveFailures + 1;
    await this.prisma.working.cronJobConfig.update({
      where: { id: job.id },
      data: {
        lastRunAt: runLog.startedAt,
        lastRunStatus: status,
        lastRunDurationMs: durationMs,
        lastRunError: getErrorMessage(err),
        totalFailCount: { increment: 1 },
        totalRunCount: { increment: 1 },
        consecutiveFailures: newConsec,
        isRunning: false,
        nextRunAt: this.safeNextRun(job),
        successRate: this.calcSuccessRate(job.totalRunCount + 1, job.totalFailCount + 1),
      },
    });

    // Alert check
    if (newConsec >= job.alertAfterConsecutiveFailures) {
      if ((status === 'FAILED' && job.alertOnFailure) || (status === 'TIMEOUT' && job.alertOnTimeout)) {
        this.alert.sendAlert(job, getErrorMessage(err), updated).catch(() => {});
      }
    }

    // Retry
    if (retryAttempt < job.maxRetries) {
      this.logger.warn(`Retrying ${job.jobCode} (attempt ${retryAttempt + 1}/${job.maxRetries})`);
      setTimeout(() => this.run(job.jobCode, 'RETRY', retryAttempt + 1), job.retryDelaySeconds * 1000);
    }

    return updated;
  }

  private async logSkipped(job: CronJobConfig, triggeredBy: string): Promise<CronJobRunLog> {
    this.logger.warn(`Skipping ${job.jobCode} � already running`);
    return this.prisma.working.cronJobRunLog.create({
      data: {
        jobId: job.id,
        jobCode: job.jobCode,
        startedAt: new Date(),
        finishedAt: new Date(),
        durationMs: 0,
        status: 'SKIPPED',
        triggeredBy,
      },
    });
  }

  private async updateJobSuccess(job: CronJobConfig, durationMs: number, records?: number): Promise<void> {
    const newTotal = job.totalRunCount + 1;
    const newAvg = job.avgDurationMs
      ? Math.round((job.avgDurationMs * job.totalRunCount + durationMs) / newTotal)
      : durationMs;

    await this.prisma.working.cronJobConfig.update({
      where: { id: job.id },
      data: {
        lastRunAt: new Date(),
        lastRunStatus: 'SUCCESS',
        lastRunDurationMs: durationMs,
        lastRunError: null,
        lastRunRecords: records,
        totalRunCount: newTotal,
        consecutiveFailures: 0,
        avgDurationMs: newAvg,
        nextRunAt: this.safeNextRun(job),
        successRate: this.calcSuccessRate(newTotal, job.totalFailCount),
      },
    });
  }

  private safeNextRun(job: CronJobConfig): Date | null {
    try {
      return this.parser.getNextRun(job.cronExpression, job.timezone);
    } catch {
      return null;
    }
  }

  private calcSuccessRate(total: number, failures: number): Decimal {
    if (total === 0) return new Decimal(100);
    return new Decimal(((total - failures) / total) * 100).toDecimalPlaces(2);
  }
}
