import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

/** Provides dashboard metrics and health data for cron jobs. */
@Injectable()
export class CronAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get full dashboard overview. */
  async getDashboard(): Promise<any> {
    const allJobs = await this.prisma.working.cronJobConfig.findMany();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentRuns = await this.prisma.working.cronJobRunLog.findMany({
      where: { createdAt: { gte: twentyFourHoursAgo } },
      orderBy: { createdAt: 'desc' },
    });

    const activeJobs = allJobs.filter((j) => j.status === 'ACTIVE').length;
    const pausedJobs = allJobs.filter((j) => j.status === 'PAUSED').length;
    const running = allJobs.filter((j) => j.isRunning);
    const failedRuns = recentRuns.filter((r) => r.status === 'FAILED' || r.status === 'TIMEOUT');
    const successRuns = recentRuns.filter((r) => r.status === 'SUCCESS');

    return {
      overview: {
        totalJobs: allJobs.length,
        activeJobs,
        pausedJobs,
        currentlyRunning: running.length,
        failedLast24h: failedRuns.length,
        successRate24h: recentRuns.length
          ? Math.round((successRuns.length / recentRuns.length) * 10000) / 100
          : 100,
      },
      currentlyRunning: running.map((j) => ({
        jobCode: j.jobCode,
        startedAt: j.lastRunAt,
        runningForMs: j.lastRunAt ? now.getTime() - j.lastRunAt.getTime() : 0,
      })),
      recentFailures: allJobs
        .filter((j) => j.consecutiveFailures > 0)
        .map((j) => ({
          jobCode: j.jobCode,
          lastRunAt: j.lastRunAt,
          error: j.lastRunError,
          consecutiveFailures: j.consecutiveFailures,
        })),
      nextUp: allJobs
        .filter((j) => j.status === 'ACTIVE' && j.nextRunAt)
        .sort((a, b) => (a.nextRunAt!.getTime() - b.nextRunAt!.getTime()))
        .slice(0, 10)
        .map((j) => ({
          jobCode: j.jobCode,
          nextRunAt: j.nextRunAt,
          inMs: j.nextRunAt!.getTime() - now.getTime(),
        })),
    };
  }

  /** Get today's timeline of job executions. */
  async getTimeline(): Promise<any[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.working.cronJobRunLog.findMany({
      where: { createdAt: { gte: startOfDay } },
      select: {
        jobCode: true,
        startedAt: true,
        finishedAt: true,
        durationMs: true,
        status: true,
        triggeredBy: true,
      },
      orderBy: { startedAt: 'asc' },
    });
  }

  /** Get health score per job. */
  async getHealth(): Promise<any[]> {
    return this.prisma.working.cronJobConfig.findMany({
      where: { status: 'ACTIVE' },
      select: {
        jobCode: true,
        jobName: true,
        successRate: true,
        avgDurationMs: true,
        lastRunStatus: true,
        lastRunAt: true,
        consecutiveFailures: true,
        totalRunCount: true,
        totalFailCount: true,
      },
      orderBy: { jobCode: 'asc' },
    });
  }
}
