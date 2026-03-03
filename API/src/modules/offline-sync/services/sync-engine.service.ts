import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { WarningEvaluatorService, WarningEvaluation } from './warning-evaluator.service';

export interface SyncConfig {
  policies: SyncPolicyConfig[];
  warningRules: SyncWarningRuleConfig[];
  globalSettings: GlobalSyncSettings;
  serverTimestamp: string;
}

export interface SyncPolicyConfig {
  entityName: string;
  displayName: string;
  direction: string;
  syncIntervalMinutes: number;
  maxRowsOffline: number | null;
  maxDataAgeDays: number | null;
  conflictStrategy: string;
  downloadScope: string;
  syncPriority: number;
}

export interface SyncWarningRuleConfig {
  ruleId: string;
  name: string;
  trigger: string;
  entity: string | null;
  level1: { threshold: number | null; action: string; message: string | null } | null;
  level2: { threshold: number | null; action: string | null; delayMinutes: number | null; message: string | null } | null;
  level3: { threshold: number | null; action: string | null; message: string | null } | null;
}

export interface GlobalSyncSettings {
  maxTotalStorageMb: number;
  heartbeatIntervalMinutes: number;
  syncOnAppOpen: boolean;
  syncOnNetworkRestore: boolean;
  requireSyncBeforeActivity: boolean;
  maxOfflineDaysBeforeLock: number;
}

export interface SyncStatus {
  device: any;
  warnings: WarningEvaluation;
}

@Injectable()
export class SyncEngineService {
  private readonly logger = new Logger(SyncEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly warningEvaluator: WarningEvaluatorService,
  ) {}

  async getConfig(userId: string): Promise<SyncConfig> {
    const policies = await this.prisma.syncPolicy.findMany({
      where: { isEnabled: true },
      orderBy: { syncPriority: 'asc' },
    });

    const rules = await this.prisma.syncWarningRule.findMany({
      where: { isEnabled: true },
      include: { policy: true },
      orderBy: { priority: 'asc' },
    });

    return {
      policies: policies.map((p) => ({
        entityName: p.entityName,
        displayName: p.displayName,
        direction: p.direction,
        syncIntervalMinutes: p.syncIntervalMinutes,
        maxRowsOffline: p.maxRowsOffline,
        maxDataAgeDays: p.maxDataAgeDays,
        conflictStrategy: p.conflictStrategy,
        downloadScope: p.downloadScope,
        syncPriority: p.syncPriority,
      })),
      warningRules: rules.map((r) => ({
        ruleId: r.id,
        name: r.name,
        trigger: r.trigger,
        entity: r.policy?.entityName || null,
        level1: {
          threshold: r.level1Threshold ? Number(r.level1Threshold) : null,
          action: r.level1Action,
          message: r.level1Message,
        },
        level2: r.level2Action
          ? {
              threshold: r.level2Threshold ? Number(r.level2Threshold) : null,
              action: r.level2Action,
              delayMinutes: r.level2DelayMinutes,
              message: r.level2Message,
            }
          : null,
        level3: r.level3Action
          ? {
              threshold: r.level3Threshold ? Number(r.level3Threshold) : null,
              action: r.level3Action,
              message: r.level3Message,
            }
          : null,
      })),
      globalSettings: {
        maxTotalStorageMb: 500,
        heartbeatIntervalMinutes: 15,
        syncOnAppOpen: true,
        syncOnNetworkRestore: true,
        requireSyncBeforeActivity: false,
        maxOfflineDaysBeforeLock: 30,
      },
      serverTimestamp: new Date().toISOString(),
    };
  }

  async getSyncStatus(userId: string, deviceId: string): Promise<SyncStatus> {
    const device = await this.prisma.syncDevice.findFirst({
      where: { userId, deviceId },
    });

    const warnings = await this.warningEvaluator.evaluateWarnings(userId, deviceId);

    return { device, warnings };
  }

  async registerDevice(
    userId: string,
    deviceInfo: {
      deviceId: string;
      deviceName?: string;
      deviceType?: string;
      platform?: string;
      appVersion?: string;
    },
  ): Promise<any> {
    const existing = await this.prisma.syncDevice.findFirst({
      where: { userId, deviceId: deviceInfo.deviceId },
    });

    if (existing) {
      return this.prisma.syncDevice.update({
        where: { id: existing.id },
        data: {
          deviceName: deviceInfo.deviceName ?? existing.deviceName,
          deviceType: deviceInfo.deviceType ?? existing.deviceType,
          platform: deviceInfo.platform ?? existing.platform,
          appVersion: deviceInfo.appVersion ?? existing.appVersion,
          status: 'ACTIVE',
          lastHeartbeatAt: new Date(),
        },
      });
    }

    const device = await this.prisma.syncDevice.create({
      data: {
        userId,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        platform: deviceInfo.platform,
        appVersion: deviceInfo.appVersion,
        status: 'ACTIVE',
        lastHeartbeatAt: new Date(),
      },
    });

    // Log audit
    await this.prisma.syncAuditLog.create({
      data: {
        userId,
        deviceId: deviceInfo.deviceId,
        action: 'DEVICE_REGISTER',
        details: deviceInfo,
      },
    });

    return device;
  }

  async removeDevice(userId: string, deviceId: string): Promise<void> {
    const device = await this.prisma.syncDevice.findFirst({
      where: { userId, deviceId },
    });
    if (!device) throw new NotFoundException(`Device "${deviceId}" not found`);

    await this.prisma.syncDevice.update({
      where: { id: device.id },
      data: { status: 'INACTIVE' },
    });

    await this.prisma.syncAuditLog.create({
      data: {
        userId,
        deviceId,
        action: 'DEVICE_REMOVE',
      },
    });
  }

  async heartbeat(
    userId: string,
    deviceId: string,
    statusData: {
      pendingUploadCount?: number;
      storageUsedMb?: number;
      recordCounts?: Record<string, number>;
      entitySyncState?: Record<string, any>;
    },
    ipAddress?: string,
  ): Promise<void> {
    const device = await this.prisma.syncDevice.findFirst({
      where: { userId, deviceId },
    });
    if (!device) return;

    const updateData: Record<string, any> = {
      lastHeartbeatAt: new Date(),
      lastIpAddress: ipAddress,
    };

    if (statusData.pendingUploadCount !== undefined) {
      updateData.pendingUploadCount = statusData.pendingUploadCount;
    }
    if (statusData.storageUsedMb !== undefined) {
      updateData.storageUsedMb = statusData.storageUsedMb;
    }
    if (statusData.recordCounts !== undefined) {
      updateData.recordCounts = statusData.recordCounts;
    }
    if (statusData.entitySyncState !== undefined) {
      updateData.entitySyncState = statusData.entitySyncState;
    }
    if (statusData.pendingUploadCount !== undefined && statusData.pendingUploadCount > 0) {
      // Only update oldestPendingAt if not already set
      if (!device.oldestPendingAt) {
        updateData.oldestPendingAt = new Date();
      }
    } else if (statusData.pendingUploadCount === 0) {
      updateData.oldestPendingAt = null;
    }

    await this.prisma.syncDevice.update({
      where: { id: device.id },
      data: updateData,
    });

    await this.prisma.syncAuditLog.create({
      data: {
        userId,
        deviceId,
        action: 'HEARTBEAT',
        details: { pendingUploadCount: statusData.pendingUploadCount, storageUsedMb: statusData.storageUsedMb },
      },
    });
  }

  async blockDevice(deviceDbId: string): Promise<void> {
    await this.prisma.syncDevice.update({
      where: { id: deviceDbId },
      data: { status: 'BLOCKED' },
    });
  }

  async getDevices(filters: { userId?: string; status?: string }): Promise<any[]> {
    const where: Record<string, any> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    return this.prisma.syncDevice.findMany({
      where,
      orderBy: { lastHeartbeatAt: 'desc' },
    });
  }
}
