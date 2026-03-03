import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EntityResolverService } from './entity-resolver.service';
import { SyncScopeResolverService } from './sync-scope-resolver.service';

export interface PullParams {
  entityName: string;
  userId: string;
  deviceId: string;
  lastPulledAt: Date | null;
  cursor?: string;
  limit?: number;
}

export interface PullResult {
  entityName: string;
  records: any[];
  deletedIds: string[];
  totalAvailable: number;
  downloadedCount: number;
  serverTimestamp: Date;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface FullSyncResult {
  entities: { name: string; count: number; timestamp: Date }[];
  totalRecords: number;
  durationMs: number;
}

@Injectable()
export class PullService {
  private readonly logger = new Logger(PullService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entityResolver: EntityResolverService,
    private readonly scopeResolver: SyncScopeResolverService,
  ) {}

  async pull(params: PullParams): Promise<PullResult> {
    const { entityName, userId, deviceId, lastPulledAt, cursor, limit = 500 } = params;
    const startTime = Date.now();
    const serverTimestamp = new Date();

    // 1. Load policy
    const policy = await this.prisma.syncPolicy.findFirst({
      where: { entityName, isEnabled: true },
    });
    if (!policy) {
      throw new BadRequestException(`No sync policy found for entity "${entityName}"`);
    }
    if (policy.direction === 'UPLOAD_ONLY' || policy.direction === 'DISABLED') {
      throw new BadRequestException(`Download not allowed for entity "${entityName}" (direction: ${policy.direction})`);
    }

    // 2. Build scope
    const scopeWhere = await this.scopeResolver.resolveScope(userId, entityName, policy.downloadScope);

    // 3. Apply download filter
    const filterWhere = policy.downloadFilter
      ? this.parseDownloadFilter(policy.downloadFilter as Record<string, any>)
      : {};

    // 4. Build delta query
    const deltaWhere = lastPulledAt ? { updatedAt: { gt: lastPulledAt } } : {};
    const cursorWhere = cursor ? { id: { gt: cursor } } : {};

    const where = { ...scopeWhere, ...filterWhere, ...deltaWhere, ...cursorWhere };

    // 5. Fetch entity config for includes
    const config = this.entityResolver.getEntityConfig(entityName);
    const delegate = this.entityResolver.getDelegate(entityName);

    // Count total available
    const totalAvailable = await delegate.count({ where: { ...scopeWhere, ...filterWhere } });

    // Fetch records with limit
    const effectiveLimit = policy.maxRowsOffline
      ? Math.min(limit, policy.maxRowsOffline)
      : limit;

    const records = await delegate.findMany({
      where,
      include: config.syncInclude || undefined,
      orderBy: { updatedAt: 'asc' },
      take: effectiveLimit + 1, // fetch one extra to detect hasMore
    });

    const hasMore = records.length > effectiveLimit;
    const actualRecords = hasMore ? records.slice(0, effectiveLimit) : records;
    const nextCursor = hasMore ? actualRecords[actualRecords.length - 1]?.id : null;

    // 6. Detect "deleted" records (isActive=false or terminal status since lastPulledAt)
    const deletedIds = lastPulledAt
      ? await this.findDeletedIds(delegate, config, scopeWhere, filterWhere, lastPulledAt)
      : [];

    // 7. Strip excluded fields
    const cleanedRecords = this.stripExcludedFields(actualRecords, config.excludeFields);

    // 8. Update device sync state
    await this.updateDeviceSyncState(userId, deviceId, entityName, serverTimestamp, cleanedRecords.length);

    // 9. Log to audit
    const durationMs = Date.now() - startTime;
    await this.prisma.syncAuditLog.create({
      data: {
        userId,
        deviceId,
        action: 'PULL',
        entityName,
        recordsPulled: cleanedRecords.length,
        durationMs,
        details: { lastPulledAt: lastPulledAt?.toISOString(), totalAvailable, hasMore },
      },
    });

    return {
      entityName,
      records: cleanedRecords,
      deletedIds,
      totalAvailable,
      downloadedCount: cleanedRecords.length,
      serverTimestamp,
      hasMore,
      nextCursor,
    };
  }

  async fullSync(userId: string, deviceId: string): Promise<FullSyncResult> {
    const startTime = Date.now();
    const policies = await this.prisma.syncPolicy.findMany({
      where: {
        isEnabled: true,
        direction: { not: 'UPLOAD_ONLY' },
      },
      orderBy: { syncPriority: 'asc' },
    });

    const entities: { name: string; count: number; timestamp: Date }[] = [];
    let totalRecords = 0;

    for (const policy of policies) {
      if (policy.direction === 'DISABLED') continue;
      try {
        const result = await this.pull({
          entityName: policy.entityName,
          userId,
          deviceId,
          lastPulledAt: null,
        });
        entities.push({
          name: policy.entityName,
          count: result.downloadedCount,
          timestamp: result.serverTimestamp,
        });
        totalRecords += result.downloadedCount;
      } catch (err: any) {
        this.logger.warn(`Full sync skip ${policy.entityName}: ${err.message}`);
      }
    }

    return {
      entities,
      totalRecords,
      durationMs: Date.now() - startTime,
    };
  }

  private async findDeletedIds(
    delegate: any,
    config: any,
    scopeWhere: Record<string, any>,
    filterWhere: Record<string, any>,
    lastPulledAt: Date,
  ): Promise<string[]> {
    const ids: string[] = [];

    if (config.softDeleteField === 'isActive') {
      // Records deactivated since last pull
      const deactivated = await delegate.findMany({
        where: {
          ...scopeWhere,
          ...filterWhere,
          isActive: false,
          updatedAt: { gt: lastPulledAt },
        },
        select: { id: true },
      });
      ids.push(...deactivated.map((r: any) => r.id));
    }

    if (config.terminalStatuses.length > 0) {
      // Records moved to terminal status since last pull
      const terminated = await delegate.findMany({
        where: {
          ...scopeWhere,
          ...filterWhere,
          status: { in: config.terminalStatuses },
          updatedAt: { gt: lastPulledAt },
        },
        select: { id: true },
      });
      ids.push(...terminated.map((r: any) => r.id));
    }

    return [...new Set(ids)];
  }

  private stripExcludedFields(records: any[], excludeFields: string[]): any[] {
    if (excludeFields.length === 0) return records;
    return records.map((r) => {
      const clean = { ...r };
      for (const field of excludeFields) {
        delete clean[field];
      }
      return clean;
    });
  }

  private async updateDeviceSyncState(
    userId: string,
    deviceId: string,
    entityName: string,
    timestamp: Date,
    rowCount: number,
  ): Promise<void> {
    const device = await this.prisma.syncDevice.findFirst({
      where: { userId, deviceId },
    });
    if (!device) return;

    const entitySyncState = (device.entitySyncState as Record<string, any>) || {};
    entitySyncState[entityName] = {
      ...entitySyncState[entityName],
      lastPulledAt: timestamp.toISOString(),
      rowCount,
    };

    await this.prisma.syncDevice.update({
      where: { id: device.id },
      data: {
        entitySyncState,
        lastSyncAt: timestamp,
      },
    });
  }

  private parseDownloadFilter(filter: Record<string, any>): Record<string, any> {
    const where: Record<string, any> = {};
    for (const [field, condition] of Object.entries(filter)) {
      if (typeof condition === 'object' && condition !== null) {
        const prismaCondition: Record<string, any> = {};
        for (const [op, value] of Object.entries(condition as Record<string, any>)) {
          switch (op) {
            case 'not_in':
              prismaCondition.notIn = value;
              break;
            case 'in':
              prismaCondition.in = value;
              break;
            case 'gte':
              if (value === 'last_90_days') {
                prismaCondition.gte = new Date(Date.now() - 90 * 86400000);
              } else if (value === 'last_30_days') {
                prismaCondition.gte = new Date(Date.now() - 30 * 86400000);
              } else {
                prismaCondition.gte = value;
              }
              break;
            default:
              prismaCondition[op] = value;
          }
        }
        where[field] = prismaCondition;
      } else {
        where[field] = condition;
      }
    }
    return where;
  }
}
