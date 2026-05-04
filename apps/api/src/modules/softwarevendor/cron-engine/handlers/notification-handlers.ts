import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';

/** Cleanup old notifications older than retention days. */
@Injectable()
export class NotificationCleanupHandler implements ICronJobHandler {
  readonly jobCode = 'NOTIFICATION_CLEANUP';
  private readonly logger = new Logger(NotificationCleanupHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: Record<string, any>): Promise<CronJobResult> {
    try {
      const days = params.retentionDays ?? 90;
      const cutoff = new Date(Date.now() - days * 86400000);
      const archived = await this.prisma.working.notification.deleteMany({
        where: { status: 'READ', createdAt: { lt: cutoff } },
      });
      const expired = await this.prisma.working.notification.deleteMany({
        where: { createdAt: { lt: new Date(Date.now() - 180 * 86400000) } },
      });
      return { recordsProcessed: archived.count + expired.count };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`NotificationCleanupHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}

/** Process hourly notification digests. */
@Injectable()
export class DigestHourlyHandler implements ICronJobHandler {
  readonly jobCode = 'DIGEST_HOURLY';
  private readonly logger = new Logger(DigestHourlyHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    try {
      const prefs = await this.prisma.working.notificationPreference.findMany({
        where: { digestFrequency: 'HOURLY' },
      });
      return { recordsProcessed: prefs.length };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`DigestHourlyHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}

/** Process daily notification digests. */
@Injectable()
export class DigestDailyHandler implements ICronJobHandler {
  readonly jobCode = 'DIGEST_DAILY';
  private readonly logger = new Logger(DigestDailyHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    try {
      const prefs = await this.prisma.working.notificationPreference.findMany({
        where: { digestFrequency: 'DAILY' },
      });
      return { recordsProcessed: prefs.length };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`DigestDailyHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}

/** Process weekly notification digests. */
@Injectable()
export class DigestWeeklyHandler implements ICronJobHandler {
  readonly jobCode = 'DIGEST_WEEKLY';
  private readonly logger = new Logger(DigestWeeklyHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    try {
      const prefs = await this.prisma.working.notificationPreference.findMany({
        where: { digestFrequency: 'WEEKLY' },
      });
      return { recordsProcessed: prefs.length };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`DigestWeeklyHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}

/** Regroup ungrouped notifications. */
@Injectable()
export class RegroupNotificationsHandler implements ICronJobHandler {
  readonly jobCode = 'REGROUP_NOTIFICATIONS';
  private readonly logger = new Logger(RegroupNotificationsHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    try {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000);
      const ungrouped = await this.prisma.working.notification.findMany({
        where: { groupKey: null, createdAt: { gte: cutoff } },
      });
      return { recordsProcessed: ungrouped.length };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`RegroupNotificationsHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}

/** Cleanup inactive push subscriptions. */
@Injectable()
export class CleanupPushSubscriptionsHandler implements ICronJobHandler {
  readonly jobCode = 'CLEANUP_PUSH_SUBSCRIPTIONS';
  private readonly logger = new Logger(CleanupPushSubscriptionsHandler.name);
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    try {
      const cutoff = new Date(Date.now() - 60 * 86400000);
      const result = await this.prisma.working.pushSubscription.deleteMany({
        where: { isActive: false, updatedAt: { lt: cutoff } },
      });
      return { recordsProcessed: result.count };
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`CleanupPushSubscriptionsHandler failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}
