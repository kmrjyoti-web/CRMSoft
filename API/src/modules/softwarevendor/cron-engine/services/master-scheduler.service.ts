import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as cron from 'node-cron';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { JobRunnerService } from './job-runner.service';
import { CronParserService } from './cron-parser.service';

/**
 * Central scheduler engine.
 * Loads all jobs from DB on startup, registers with node-cron,
 * and dynamically re-registers when admin updates a job.
 */
@Injectable()
export class MasterSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MasterSchedulerService.name);
  private scheduledTasks = new Map<string, cron.ScheduledTask>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly runner: JobRunnerService,
    private readonly parser: CronParserService,
  ) {}

  /** On app start: load all jobs from DB, register active ones. */
  async onModuleInit(): Promise<void> {
    // Skip cron jobs in production if DISABLE_CRON is set (saves DB connections)
    if (process.env.DISABLE_CRON === 'true') {
      this.logger.log('Cron jobs disabled via DISABLE_CRON env var');
      return;
    }
    const jobs = await this.prisma.working.cronJobConfig.findMany();
    let registered = 0;

    for (const job of jobs) {
      if (job.status !== 'ACTIVE') continue;
      if (!cron.validate(job.cronExpression)) {
        this.logger.warn(`Invalid cron expression for ${job.jobCode}: ${job.cronExpression}`);
        continue;
      }
      this.scheduleJob(job.jobCode, job.cronExpression, job.timezone);
      await this.updateNextRun(job.jobCode, job.cronExpression, job.timezone);
      registered++;
    }

    this.logger.log(`Registered ${registered}/${jobs.length} cron jobs`);
  }

  /** On app shutdown: cancel all tasks. */
  onModuleDestroy(): void {
    for (const [code, task] of this.scheduledTasks) {
      void task.stop();
      this.logger.log(`Stopped job: ${code}`);
    }
    this.scheduledTasks.clear();
  }

  /** Register or re-register a single job. */
  async registerJob(jobCode: string): Promise<void> {
    this.cancelJobSync(jobCode);

    const job = await this.prisma.working.cronJobConfig.findUnique({
      where: { jobCode },
    });
    if (!job || job.status !== 'ACTIVE') return;

    if (!cron.validate(job.cronExpression)) {
      this.logger.warn(`Invalid cron: ${job.jobCode} → ${job.cronExpression}`);
      return;
    }

    this.scheduleJob(job.jobCode, job.cronExpression, job.timezone);
    await this.updateNextRun(job.jobCode, job.cronExpression, job.timezone);
    this.logger.log(`Re-registered job: ${jobCode}`);
  }

  /** Cancel a single job. */
  cancelJob(jobCode: string): void {
    this.cancelJobSync(jobCode);
    this.logger.log(`Cancelled job: ${jobCode}`);
  }

  /** Reload all jobs (after bulk config change). */
  async reloadAll(): Promise<void> {
    for (const task of this.scheduledTasks.values()) void task.stop();
    this.scheduledTasks.clear();
    await this.onModuleInit();
  }

  /** Force-run a job immediately (admin "Run Now"). */
  async forceRun(jobCode: string, triggeredBy: string): Promise<any> {
    return this.runner.run(jobCode, triggeredBy);
  }

  /** Get status of all scheduled tasks. */
  getScheduledStatus(): Array<{
    jobCode: string;
    isScheduled: boolean;
    nextRun: Date | null;
  }> {
    const result: Array<{ jobCode: string; isScheduled: boolean; nextRun: Date | null }> = [];
    for (const [code] of this.scheduledTasks) {
      let nextRun: Date | null = null;
      try {
        nextRun = this.parser.getNextRun(code);
      } catch { /* ignore */ }
      result.push({ jobCode: code, isScheduled: true, nextRun });
    }
    return result;
  }

  private scheduleJob(jobCode: string, expression: string, timezone: string): void {
    const task = cron.schedule(
      expression,
      () => {
        this.runner.run(jobCode, 'SCHEDULER').catch((err) => {
          this.logger.error(`Scheduler error for ${jobCode}: ${err.message}`);
        });
      },
      { timezone },
    );
    this.scheduledTasks.set(jobCode, task);
  }

  private cancelJobSync(jobCode: string): void {
    const existing = this.scheduledTasks.get(jobCode);
    if (existing) {
      void existing.stop();
      this.scheduledTasks.delete(jobCode);
    }
  }

  private async updateNextRun(
    jobCode: string,
    expression: string,
    timezone: string,
  ): Promise<void> {
    try {
      const nextRunAt = this.parser.getNextRun(expression, timezone);
      await this.prisma.working.cronJobConfig.update({
        where: { jobCode },
        data: { nextRunAt },
      });
    } catch { /* ignore parse errors */ }
  }
}
