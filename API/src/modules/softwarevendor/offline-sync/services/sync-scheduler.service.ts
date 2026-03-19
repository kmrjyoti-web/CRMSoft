import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/working-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class SyncSchedulerService {
  private readonly logger = new Logger(SyncSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Expire stale flush commands — hourly: PENDING > 7 days -> FAILED.
   * Called by cron-engine (EXPIRE_STALE_FLUSH_COMMANDS).
   */
  async expireStaleFlushCommands(): Promise<void> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const result = await this.prisma.working.syncFlushCommand.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: sevenDaysAgo },
      },
      data: { status: 'FAILED' },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} stale flush commands`);

      // Clear pending flush from affected devices
      await this.prisma.working.syncDevice.updateMany({
        where: {
          status: 'FLUSH_PENDING',
          pendingFlushId: { not: null },
        },
        data: { pendingFlushId: null, status: 'ACTIVE' },
      });
    }
  }

  /**
   * 2. Clean old sync change logs — daily 3 AM: isPushed=true AND createdAt < 30 days -> delete.
   * Called by cron-engine (CLEAN_OLD_CHANGE_LOGS).
   */
  async cleanOldChangeLogs(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const result = await this.prisma.working.syncChangeLog.deleteMany({
      where: {
        isPushed: true,
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned ${result.count} old sync change logs`);
    }
  }

  /**
   * 3. Clean old audit logs — weekly Sunday 3:30 AM: createdAt < 90 days -> delete.
   * Called by cron-engine (CLEAN_OLD_SYNC_AUDIT_LOGS).
   */
  async cleanOldAuditLogs(): Promise<void> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000);
    const result = await this.prisma.working.syncAuditLog.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned ${result.count} old sync audit logs`);
    }
  }

  /**
   * 4. Device health check — hourly at :30: devices with lastHeartbeat > 48 hours -> INACTIVE.
   * Called by cron-engine (DEVICE_HEALTH_CHECK).
   */
  async deviceHealthCheck(): Promise<void> {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600000);
    const result = await this.prisma.working.syncDevice.updateMany({
      where: {
        status: 'ACTIVE',
        lastHeartbeatAt: { lt: fortyEightHoursAgo },
      },
      data: { status: 'INACTIVE' },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} devices as INACTIVE (no heartbeat > 48h)`);
    }
  }

  /**
   * 5. Auto-resolve old conflicts — daily 4 AM: PENDING > 7 days -> auto-resolve with SERVER_WINS.
   * Called by cron-engine (AUTO_RESOLVE_OLD_CONFLICTS).
   */
  async autoResolveOldConflicts(): Promise<void> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const oldConflicts = await this.prisma.working.syncConflict.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: sevenDaysAgo },
      },
    });

    if (oldConflicts.length === 0) return;

    for (const conflict of oldConflicts) {
      await this.prisma.working.syncConflict.update({
        where: { id: conflict.id },
        data: {
          status: 'SERVER_APPLIED',
          resolvedBy: 'SYSTEM_AUTO',
          resolvedStrategy: 'SERVER_WINS',
          resolvedData: (conflict.serverData ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          resolvedAt: new Date(),
        },
      });
    }

    this.logger.log(`Auto-resolved ${oldConflicts.length} old conflicts with SERVER_WINS`);
  }

  /**
   * 6. Recalculate device storage — daily 5 AM: update storageUsedMb, recordCounts per device.
   * Called by cron-engine (RECALCULATE_DEVICE_STORAGE).
   */
  async recalculateDeviceStorage(): Promise<void> {
    const activeDevices = await this.prisma.working.syncDevice.findMany({
      where: { status: { in: ['ACTIVE', 'FLUSH_PENDING'] } },
    });

    for (const device of activeDevices) {
      const pendingCount = await this.prisma.working.syncChangeLog.count({
        where: { userId: device.userId, deviceId: device.deviceId, isPushed: false },
      });

      const oldestPending = pendingCount > 0
        ? await this.prisma.working.syncChangeLog.findFirst({
            where: { userId: device.userId, deviceId: device.deviceId, isPushed: false },
            orderBy: { clientTimestamp: 'asc' },
            select: { clientTimestamp: true },
          })
        : null;

      await this.prisma.working.syncDevice.update({
        where: { id: device.id },
        data: {
          pendingUploadCount: pendingCount,
          oldestPendingAt: oldestPending?.clientTimestamp || null,
        },
      });
    }

    if (activeDevices.length > 0) {
      this.logger.log(`Recalculated storage for ${activeDevices.length} active devices`);
    }
  }

  /**
   * 7. Sync analytics snapshot — daily 6 AM: aggregate daily metrics.
   * Called by cron-engine (SYNC_ANALYTICS_SNAPSHOT).
   */
  async syncAnalyticsSnapshot(): Promise<void> {
    const yesterday = new Date(Date.now() - 86400000);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pullCount, pushCount, conflictsCreated, conflictsResolved] = await Promise.all([
      this.prisma.working.syncAuditLog.count({
        where: { action: 'PULL', createdAt: { gte: yesterday, lt: today } },
      }),
      this.prisma.working.syncAuditLog.count({
        where: { action: 'PUSH', createdAt: { gte: yesterday, lt: today } },
      }),
      this.prisma.working.syncConflict.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      this.prisma.working.syncConflict.count({
        where: { resolvedAt: { gte: yesterday, lt: today } },
      }),
    ]);

    this.logger.log(
      `Daily sync snapshot: pulls=${pullCount}, pushes=${pushCount}, ` +
      `conflicts_created=${conflictsCreated}, conflicts_resolved=${conflictsResolved}`,
    );
  }
}
