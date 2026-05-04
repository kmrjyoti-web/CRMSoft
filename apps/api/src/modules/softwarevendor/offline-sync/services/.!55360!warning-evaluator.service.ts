import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

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
    const device = await this.prisma.working.syncDevice.findFirst({
      where: { userId, deviceId },
    });

    // Load all enabled warning rules
    const rules = await this.prisma.working.syncWarningRule.findMany({
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
