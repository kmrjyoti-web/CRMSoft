import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Called by cron-engine (NOTIFICATION_CLEANUP). */
  async cleanupOldNotifications() {
    // Archive read notifications older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const archived = await this.prisma.notification.updateMany({
      where: {
        status: 'READ',
        isActive: true,
        readAt: { lt: thirtyDaysAgo },
      },
      data: { status: 'ARCHIVED', isActive: false },
    });

    // Hard delete dismissed notifications older than 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const deleted = await this.prisma.notification.deleteMany({
      where: {
        status: { in: ['DISMISSED', 'ARCHIVED'] },
        updatedAt: { lt: ninetyDaysAgo },
      },
    });

    if (archived.count > 0 || deleted.count > 0) {
      this.logger.log(
        `Cleanup: archived ${archived.count} read, deleted ${deleted.count} old dismissed/archived`,
      );
    }
  }

  /** Called by cron-engine (CLEANUP_PUSH_SUBSCRIPTIONS). */
  async cleanupInactivePushSubscriptions() {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const deleted = await this.prisma.pushSubscription.deleteMany({
      where: {
        isActive: false,
        updatedAt: { lt: sixtyDaysAgo },
      },
    });

    if (deleted.count > 0) {
      this.logger.log(`Cleaned up ${deleted.count} inactive push subscriptions`);
    }
  }
}
