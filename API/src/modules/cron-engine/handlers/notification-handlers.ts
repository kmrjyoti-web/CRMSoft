import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';

/** Cleanup old notifications older than retention days. */
@Injectable()
export class NotificationCleanupHandler implements ICronJobHandler {
  readonly jobCode = 'NOTIFICATION_CLEANUP';
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: Record<string, any>): Promise<CronJobResult> {
    const days = params.retentionDays ?? 90;
    const cutoff = new Date(Date.now() - days * 86400000);
    const archived = await this.prisma.notification.deleteMany({
      where: { status: 'READ', createdAt: { lt: cutoff } },
    });
    const expired = await this.prisma.notification.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 180 * 86400000) } },
    });
    return { recordsProcessed: archived.count + expired.count };
  }
}

/** Process hourly notification digests. */
@Injectable()
export class DigestHourlyHandler implements ICronJobHandler {
  readonly jobCode = 'DIGEST_HOURLY';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const prefs = await this.prisma.notificationPreference.findMany({
      where: { digestFrequency: 'HOURLY' },
    });
    return { recordsProcessed: prefs.length };
  }
}

/** Process daily notification digests. */
@Injectable()
export class DigestDailyHandler implements ICronJobHandler {
  readonly jobCode = 'DIGEST_DAILY';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const prefs = await this.prisma.notificationPreference.findMany({
      where: { digestFrequency: 'DAILY' },
    });
    return { recordsProcessed: prefs.length };
  }
}

/** Process weekly notification digests. */
@Injectable()
export class DigestWeeklyHandler implements ICronJobHandler {
  readonly jobCode = 'DIGEST_WEEKLY';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const prefs = await this.prisma.notificationPreference.findMany({
      where: { digestFrequency: 'WEEKLY' },
    });
    return { recordsProcessed: prefs.length };
  }
}

/** Regroup ungrouped notifications. */
@Injectable()
export class RegroupNotificationsHandler implements ICronJobHandler {
  readonly jobCode = 'REGROUP_NOTIFICATIONS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const ungrouped = await this.prisma.notification.findMany({
      where: { groupKey: null, createdAt: { gte: cutoff } },
    });
    return { recordsProcessed: ungrouped.length };
  }
}

/** Cleanup inactive push subscriptions. */
@Injectable()
export class CleanupPushSubscriptionsHandler implements ICronJobHandler {
  readonly jobCode = 'CLEANUP_PUSH_SUBSCRIPTIONS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const cutoff = new Date(Date.now() - 60 * 86400000);
    const result = await this.prisma.pushSubscription.deleteMany({
      where: { isActive: false, updatedAt: { lt: cutoff } },
    });
    return { recordsProcessed: result.count };
  }
}
