import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface ActiveWarning {
  ruleId: string;
  ruleName: string;
  entity: string | null;
  level: number;
  action: string;
  message: string;
  delayMinutes?: number;
  currentValue: number;
  threshold: number;
  unit: string;
}

export interface FlushCommandInfo {
  flushId: string;
  flushType: string;
  targetEntity: string | null;
  reason: string;
  redownloadAfter: boolean;
}

export interface WarningEvaluation {
  warnings: ActiveWarning[];
  overallEnforcement: string;
  blockDelayMinutes: number | null;
  mustSyncEntities: string[];
  flushCommands: FlushCommandInfo[];
}

@Injectable()
export class WarningEvaluatorService {
  private readonly logger = new Logger(WarningEvaluatorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async evaluateWarnings(userId: string, deviceId: string): Promise<WarningEvaluation> {
    // Load device
    const device = await this.prisma.syncDevice.findFirst({
      where: { userId, deviceId },
    });

    // Load all enabled warning rules
    const rules = await this.prisma.syncWarningRule.findMany({
      where: { isEnabled: true },
      include: { policy: true },
      orderBy: { priority: 'asc' },
    });

    const warnings: ActiveWarning[] = [];
    const mustSyncEntities: string[] = [];
    let overallEnforcement = 'NONE';
    let blockDelayMinutes: number | null = null;

    const entitySyncState = (device?.entitySyncState as Record<string, any>) || {};
    const now = Date.now();

    for (const rule of rules) {
      // Check role/user scope
      if (rule.appliesToRoles.length > 0 || rule.appliesToUsers.length > 0) {
        if (rule.appliesToUsers.length > 0 && !rule.appliesToUsers.includes(userId)) continue;
        // Role check would require loading user's role — skip for now if only user filter set
      }

      const entityName = rule.policy?.entityName || null;
      let currentValue = 0;

      switch (rule.trigger) {
        case 'TIME_SINCE_SYNC': {
          if (entityName) {
            const state = entitySyncState[entityName];
            const lastPulled = state?.lastPulledAt ? new Date(state.lastPulledAt).getTime() : 0;
            currentValue = lastPulled ? (now - lastPulled) / 3600000 : 9999;
          } else {
            // Global: use device lastSyncAt
            const lastSync = device?.lastSyncAt?.getTime() || 0;
            currentValue = lastSync ? (now - lastSync) / 3600000 : 9999;
          }
          break;
        }
        case 'DATA_AGE': {
          if (entityName) {
            const state = entitySyncState[entityName];
            const lastPulled = state?.lastPulledAt ? new Date(state.lastPulledAt).getTime() : 0;
            currentValue = lastPulled ? (now - lastPulled) / 86400000 : 9999;
          } else {
            const lastSync = device?.lastSyncAt?.getTime() || 0;
            currentValue = lastSync ? (now - lastSync) / 86400000 : 9999;
          }
          break;
        }
        case 'PENDING_UPLOAD_COUNT': {
          currentValue = device?.pendingUploadCount || 0;
          break;
        }
        case 'PENDING_UPLOAD_AGE': {
          const oldestPending = device?.oldestPendingAt?.getTime() || 0;
          currentValue = oldestPending ? (now - oldestPending) / 3600000 : 0;
          break;
        }
        case 'STORAGE_SIZE': {
          currentValue = device?.storageUsedMb ? Number(device.storageUsedMb) : 0;
          break;
        }
        default:
          continue;
      }

      // Evaluate escalation levels (highest first)
      const triggered = this.evaluateLevels(rule, currentValue);
      if (!triggered) continue;

      const warning: ActiveWarning = {
        ruleId: rule.id,
        ruleName: rule.name,
        entity: entityName,
        level: triggered.level,
        action: triggered.action,
        message: this.interpolateMessage(triggered.message, currentValue),
        delayMinutes: triggered.delayMinutes,
        currentValue: Math.round(currentValue * 100) / 100,
        threshold: Number(triggered.threshold),
        unit: rule.thresholdUnit,
      };

      warnings.push(warning);

      // Track enforcement escalation
      const enforcementPriority = this.getEnforcementPriority(triggered.action);
      const currentPriority = this.getEnforcementPriority(overallEnforcement);
      if (enforcementPriority > currentPriority) {
        overallEnforcement = triggered.action;
        blockDelayMinutes = triggered.delayMinutes ?? null;
      }

      if (triggered.action === 'BLOCK_UNTIL_SYNC' || triggered.action === 'FLUSH_AND_RESYNC') {
        if (entityName && !mustSyncEntities.includes(entityName)) {
          mustSyncEntities.push(entityName);
        }
      }
    }

    // Check pending flush commands
    const flushCommands = await this.getPendingFlushCommands(userId, deviceId);

    return {
      warnings,
      overallEnforcement,
      blockDelayMinutes,
      mustSyncEntities,
      flushCommands,
    };
  }

  private evaluateLevels(
    rule: any,
    currentValue: number,
  ): { level: number; action: string; message: string; threshold: number; delayMinutes?: number } | null {
    // Check level 3 first (highest severity)
    if (rule.level3Action && rule.level3Threshold != null && currentValue >= Number(rule.level3Threshold)) {
      return {
        level: 3,
        action: rule.level3Action,
        message: rule.level3Message || rule.name,
        threshold: Number(rule.level3Threshold),
      };
    }
    if (rule.level2Action && rule.level2Threshold != null && currentValue >= Number(rule.level2Threshold)) {
      return {
        level: 2,
        action: rule.level2Action,
        message: rule.level2Message || rule.name,
        threshold: Number(rule.level2Threshold),
        delayMinutes: rule.level2DelayMinutes,
      };
    }
    if (rule.level1Threshold != null && currentValue >= Number(rule.level1Threshold)) {
      return {
        level: 1,
        action: rule.level1Action,
        message: rule.level1Message || rule.name,
        threshold: Number(rule.level1Threshold),
      };
    }
    return null;
  }

  private getEnforcementPriority(action: string): number {
    switch (action) {
      case 'FLUSH_AND_RESYNC': return 4;
      case 'BLOCK_UNTIL_SYNC': return 3;
      case 'BLOCK_AFTER_DELAY': return 2;
      case 'WARN_ONLY': return 1;
      default: return 0;
    }
  }

  private interpolateMessage(message: string, value: number): string {
    return message
      .replace('{{value}}', String(Math.round(value * 10) / 10))
      .replace('{{days}}', String(Math.round(value)))
      .replace('{{hours}}', String(Math.round(value)));
  }

  private async getPendingFlushCommands(userId: string, deviceId: string): Promise<FlushCommandInfo[]> {
    const commands = await this.prisma.syncFlushCommand.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { targetUserId: userId },
          { targetDeviceId: deviceId },
          { targetUserId: null, targetDeviceId: null }, // global flush
        ],
      },
    });

    return commands.map((cmd) => ({
      flushId: cmd.id,
      flushType: cmd.flushType,
      targetEntity: cmd.targetEntity,
      reason: cmd.reason,
      redownloadAfter: cmd.redownloadAfter,
    }));
  }
}
