import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EntityResolverService } from './entity-resolver.service';
import { ConflictResolverService } from './conflict-resolver.service';

export interface OfflineChange {
  entityName: string;
  entityId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE';
  data: Record<string, any>;
  previousValues?: Record<string, any>;
  clientTimestamp: string;
  clientVersion: number;
}

export interface PushParams {
  userId: string;
  deviceId: string;
  changes: OfflineChange[];
}

export interface PushChangeResult {
  entityName: string;
  entityId: string | null;
  action: string;
  status: string;
  serverId?: string;
  conflictId?: string;
  error?: string;
}

export interface PushResult {
  results: PushChangeResult[];
  totalProcessed: number;
  successful: number;
  conflicts: number;
  failed: number;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entityResolver: EntityResolverService,
    private readonly conflictResolver: ConflictResolverService,
  ) {}

  async push(params: PushParams): Promise<PushResult> {
    const { userId, deviceId, changes } = params;
    const startTime = Date.now();

    // Sort by clientTimestamp ASC (oldest first)
    const sorted = [...changes].sort(
      (a, b) => new Date(a.clientTimestamp).getTime() - new Date(b.clientTimestamp).getTime(),
    );

    const results: PushChangeResult[] = [];
    let successful = 0;
    let conflicts = 0;
    let failed = 0;

    for (const change of sorted) {
      try {
        // Validate policy
        const policy = await this.prisma.working.syncPolicy.findFirst({
          where: { entityName: change.entityName, isEnabled: true },
        });
        if (!policy) {
          results.push({
            entityName: change.entityName,
            entityId: change.entityId || null,
            action: change.action,
            status: 'FAILED',
            error: `No sync policy for "${change.entityName}"`,
          });
          failed++;
          continue;
        }
        if (policy.direction === 'DOWNLOAD_ONLY' || policy.direction === 'DISABLED') {
          results.push({
            entityName: change.entityName,
            entityId: change.entityId || null,
            action: change.action,
            status: 'REJECTED',
            error: `Upload not allowed for "${change.entityName}" (direction: ${policy.direction})`,
          });
          failed++;
          continue;
        }

        const result = await this.processChange(change, userId, deviceId, policy);
        results.push(result);

        if (result.status === 'SUCCESS' || result.status === 'CREATED' || result.status === 'DELETED') {
          successful++;
        } else if (result.status.startsWith('CONFLICT')) {
          conflicts++;
        } else {
          failed++;
        }

        // Log to SyncChangeLog
        await this.prisma.working.syncChangeLog.create({
          data: {
            deviceId,
            userId,
            entityName: change.entityName,
            entityId: result.serverId || change.entityId || '',
            action: change.action as any,
            changedFields: change.action === 'UPDATE' ? change.data : undefined,
            fullRecord: change.action === 'CREATE' ? change.data : undefined,
            previousValues: change.previousValues,
            clientTimestamp: new Date(change.clientTimestamp),
            clientVersion: change.clientVersion,
            isPushed: true,
            pushedAt: new Date(),
            pushResult: result.status,
            conflictId: result.conflictId,
            errorMessage: result.error,
          },
        });
      } catch (err: any) {
        this.logger.error(`Push failed for ${change.entityName}/${change.entityId}: ${err.message}`);
        results.push({
          entityName: change.entityName,
          entityId: change.entityId || null,
          action: change.action,
          status: 'FAILED',
          error: err.message,
        });
        failed++;
      }
    }

    // Update device pending count
    await this.updateDevicePendingCount(userId, deviceId);

    // Log audit
    const durationMs = Date.now() - startTime;
    await this.prisma.working.syncAuditLog.create({
      data: {
        userId,
        deviceId,
        action: 'PUSH',
        recordsPushed: sorted.length,
        conflictsDetected: conflicts,
        durationMs,
        details: { successful, conflicts, failed },
      },
    });

    return {
      results,
      totalProcessed: sorted.length,
      successful,
      conflicts,
      failed,
    };
  }

  private async processChange(
    change: OfflineChange,
    userId: string,
    deviceId: string,
    policy: any,
  ): Promise<PushChangeResult> {
    const delegate = this.entityResolver.getDelegate(change.entityName);
    const clientTimestamp = new Date(change.clientTimestamp);

    switch (change.action) {
      case 'CREATE': {
        const { id, tenantId, createdAt, updatedAt, ...createData } = change.data;
        const newRecord = await delegate.create({
          data: {
            ...createData,
            createdById: userId,
          },
        });
        return {
          entityName: change.entityName,
          entityId: null,
          action: 'CREATE',
          status: 'CREATED',
          serverId: newRecord.id,
        };
      }

      case 'UPDATE': {
        if (!change.entityId) {
          return {
            entityName: change.entityName,
            entityId: null,
            action: 'UPDATE',
            status: 'FAILED',
            error: 'entityId required for UPDATE',
          };
        }

        // Load current server record
        const serverRecord = await delegate.findUnique({
          where: { id: change.entityId },
        });
        if (!serverRecord) {
          return {
            entityName: change.entityName,
            entityId: change.entityId,
            action: 'UPDATE',
            status: 'FAILED',
            error: 'Record not found on server',
          };
        }

        // Conflict detection: server modified after client's edit?
        if (serverRecord.updatedAt > clientTimestamp) {
          // CONFLICT detected
          const resolution = await this.conflictResolver.resolve({
            entityName: change.entityName,
            entityId: change.entityId,
            clientData: change.data,
            serverData: serverRecord,
            baseData: change.previousValues,
            clientTimestamp,
            serverTimestamp: serverRecord.updatedAt,
            strategy: policy.conflictStrategy,
            userId,
            deviceId,
          });

          const conflictStatus = resolution.resolved
            ? `CONFLICT_${resolution.strategy}`
            : 'CONFLICT_PENDING';

          return {
            entityName: change.entityName,
            entityId: change.entityId,
            action: 'UPDATE',
            status: conflictStatus,
            conflictId: resolution.conflictId,
          };
        }

        // No conflict — apply update
        const { id, tenantId, createdAt, updatedAt, createdById, createdByUser, ...updateData } = change.data;
        await delegate.update({
          where: { id: change.entityId },
          data: updateData,
        });
        return {
          entityName: change.entityName,
          entityId: change.entityId,
          action: 'UPDATE',
          status: 'SUCCESS',
        };
      }

      case 'DELETE':
      case 'SOFT_DELETE': {
        if (!change.entityId) {
          return {
            entityName: change.entityName,
            entityId: null,
            action: change.action,
            status: 'FAILED',
            error: 'entityId required for DELETE',
          };
        }

        const config = this.entityResolver.getEntityConfig(change.entityName);
        const record = await delegate.findUnique({ where: { id: change.entityId } });
        if (!record) {
          return {
            entityName: change.entityName,
            entityId: change.entityId,
            action: change.action,
            status: 'FAILED',
            error: 'Record not found',
          };
        }

        // Soft delete based on entity pattern
        if (config.softDeleteField === 'isActive') {
          await delegate.update({
            where: { id: change.entityId },
            data: { isActive: false },
          });
        } else if (config.terminalStatuses.length > 0) {
          // Use the first terminal status as the "deleted" state
          await delegate.update({
            where: { id: change.entityId },
            data: { status: config.terminalStatuses[0] },
          });
        }

        return {
          entityName: change.entityName,
          entityId: change.entityId,
          action: change.action,
          status: 'DELETED',
        };
      }

      default:
        return {
          entityName: change.entityName,
          entityId: change.entityId || null,
          action: change.action,
          status: 'FAILED',
          error: `Unknown action: ${change.action}`,
        };
    }
  }

  private async updateDevicePendingCount(userId: string, deviceId: string): Promise<void> {
    const device = await this.prisma.working.syncDevice.findFirst({
      where: { userId, deviceId },
    });
    if (!device) return;

    const pendingCount = await this.prisma.working.syncChangeLog.count({
      where: { userId, deviceId, isPushed: false },
    });

    await this.prisma.working.syncDevice.update({
      where: { id: device.id },
      data: { pendingUploadCount: pendingCount },
    });
  }
}
