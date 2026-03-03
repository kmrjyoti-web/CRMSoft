import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
import { Prisma } from '@prisma/client';

/** Expire stale flush commands older than 7 days. */
@Injectable()
export class ExpireFlushCommandsHandler implements ICronJobHandler {
  readonly jobCode = 'EXPIRE_FLUSH_COMMANDS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: Record<string, any>): Promise<CronJobResult> {
    const days = params.retentionDays ?? 7;
    const cutoff = new Date(Date.now() - days * 86400000);
    const result = await this.prisma.syncFlushCommand.updateMany({
      where: { status: 'PENDING', createdAt: { lt: cutoff } },
      data: { status: 'FAILED' },
    });
    if (result.count > 0) {
      await this.prisma.syncDevice.updateMany({
        where: { status: 'FLUSH_PENDING', pendingFlushId: { not: null } },
        data: { pendingFlushId: null, status: 'ACTIVE' },
      });
    }
    return { recordsProcessed: result.count };
  }
}

/** Clean pushed sync change logs older than retention period. */
@Injectable()
export class SyncChangelogCleanupHandler implements ICronJobHandler {
  readonly jobCode = 'SYNC_CHANGELOG_CLEANUP';
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: Record<string, any>): Promise<CronJobResult> {
    const days = params.retentionDays ?? 30;
    const cutoff = new Date(Date.now() - days * 86400000);
    const result = await this.prisma.syncChangeLog.deleteMany({
      where: { isPushed: true, createdAt: { lt: cutoff } },
    });
    return { recordsProcessed: result.count };
  }
}

/** Mark devices with no heartbeat > 48h as INACTIVE. */
@Injectable()
export class SyncDeviceHealthHandler implements ICronJobHandler {
  readonly jobCode = 'SYNC_DEVICE_HEALTH';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const cutoff = new Date(Date.now() - 48 * 3600000);
    const result = await this.prisma.syncDevice.updateMany({
      where: { status: 'ACTIVE', lastHeartbeatAt: { lt: cutoff } },
      data: { status: 'INACTIVE' },
    });
    return { recordsProcessed: result.count };
  }
}

/** Auto-resolve sync conflicts pending > 7 days with SERVER_WINS. */
@Injectable()
export class AutoResolveConflictsHandler implements ICronJobHandler {
  readonly jobCode = 'AUTO_RESOLVE_CONFLICTS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const cutoff = new Date(Date.now() - 7 * 86400000);
    const conflicts = await this.prisma.syncConflict.findMany({
      where: { status: 'PENDING', createdAt: { lt: cutoff } },
    });
    for (const c of conflicts) {
      await this.prisma.syncConflict.update({
        where: { id: c.id },
        data: {
          status: 'SERVER_APPLIED',
          resolvedBy: 'SYSTEM_AUTO',
          resolvedStrategy: 'SERVER_WINS',
          resolvedData: (c.serverData ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          resolvedAt: new Date(),
        },
      });
    }
    return { recordsProcessed: conflicts.length, recordsSucceeded: conflicts.length };
  }
}
