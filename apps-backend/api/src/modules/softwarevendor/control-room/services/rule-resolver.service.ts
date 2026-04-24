import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

/**
 * Resolution priority (highest wins):
 *   L1 INDUSTRY      — industryCode match, tenantId null
 *   L2 WORKING       — tenantId match
 *   L3 ACCOUNTING    — tenantId match
 *   L4 INVENTORY     — tenantId match
 *   L5 CONTROL_ROOM  — tenantId match, no pageCode/roleId/userId
 *   L6 PAGE          — tenantId + pageCode
 *   L7 RBAC          — tenantId + roleId or userId (userId wins over roleId)
 */

const LEVEL_PRIORITY: Record<string, number> = {
  INDUSTRY: 1,
  WORKING: 2,
  ACCOUNTING: 3,
  INVENTORY: 4,
  CONTROL_ROOM: 5,
  PAGE: 6,
  RBAC: 7,
};

export interface ResolvedRule {
  value: any;
  level: string;
  pageOverrides?: Record<string, any>;
  valueType: string;
  label: string;
  category: string;
}

export interface RuleResolutionContext {
  userId?: string;
  roleIds?: string[];
  pageCode?: string;
  industryCode?: string;
}

@Injectable()
export class RuleResolverService {
  private readonly logger = new Logger(RuleResolverService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve a single rule to its effective value by walking
   * the 7-level hierarchy top-down (highest priority wins).
   */
  async resolveRule(
    tenantId: string,
    ruleCode: string,
    context?: RuleResolutionContext,
  ): Promise<ResolvedRule | null> {
    const rule = await this.prisma.controlRoomRule.findUnique({
      where: { ruleCode },
      include: {
        values: {
          where: {
            isActive: true,
            OR: [
              // L1: industry-level (no tenant)
              { tenantId: null, level: 'INDUSTRY' },
              // L2–L5: tenant-level
              { tenantId, level: { in: ['WORKING', 'ACCOUNTING', 'INVENTORY', 'CONTROL_ROOM'] } },
              // L6: page-level
              ...(context?.pageCode
                ? [{ tenantId, level: 'PAGE' as const, pageCode: context.pageCode }]
                : []),
              // L7: RBAC — role overrides
              ...(context?.roleIds?.length
                ? [{ tenantId, level: 'RBAC' as const, roleId: { in: context.roleIds }, userId: null }]
                : []),
              // L7: RBAC — user override (highest priority)
              ...(context?.userId
                ? [{ tenantId, level: 'RBAC' as const, userId: context.userId }]
                : []),
            ],
          },
          orderBy: { setAt: 'desc' as const },
        },
      },
    });

    if (!rule) return null;

    // Filter industry values by industryCode when provided
    const values = rule.values.filter((v) => {
      if (v.level === 'INDUSTRY' && context?.industryCode) {
        return v.industryCode === context.industryCode;
      }
      if (v.level === 'INDUSTRY' && !context?.industryCode) {
        return false; // skip industry values if no code provided
      }
      return true;
    });

    // Pick the value with the highest level priority.
    // Within RBAC, userId trumps roleId.
    const winner = this.pickWinner(values);

    return {
      value: this.parseValue(winner?.value ?? rule.defaultValue, rule.valueType),
      level: winner?.level ?? 'DEFAULT',
      valueType: rule.valueType,
      label: rule.label,
      category: rule.category,
    };
  }

  /**
   * Resolve ALL rules for a user — bulk load for IndexedDB cache.
   * Returns a map keyed by ruleCode.
   */
  async resolveAllRules(
    tenantId: string,
    userId: string,
    roleIds: string[],
    industryCode?: string,
  ): Promise<Record<string, ResolvedRule>> {
    const rules = await this.prisma.controlRoomRule.findMany({
      where: { isActive: true },
      include: {
        values: {
          where: {
            isActive: true,
            OR: [
              { tenantId: null, level: 'INDUSTRY' },
              { tenantId, level: { in: ['WORKING', 'ACCOUNTING', 'INVENTORY', 'CONTROL_ROOM'] } },
              { tenantId, level: 'PAGE' },
              ...(roleIds.length
                ? [{ tenantId, level: 'RBAC' as const, roleId: { in: roleIds }, userId: null }]
                : []),
              { tenantId, level: 'RBAC' as const, userId },
            ],
          },
          orderBy: { setAt: 'desc' as const },
        },
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    const result: Record<string, ResolvedRule> = {};

    for (const rule of rules) {
      const values = rule.values.filter((v) => {
        if (v.level === 'INDUSTRY') {
          return industryCode ? v.industryCode === industryCode : false;
        }
        return true;
      });

      // Collect page-level overrides separately
      const pageOverrides: Record<string, any> = {};
      const pageValues = values.filter((v) => v.level === 'PAGE');
      for (const pv of pageValues) {
        if (pv.pageCode) {
          pageOverrides[pv.pageCode] = this.parseValue(pv.value, rule.valueType);
        }
      }

      // Resolve main value (non-page values)
      const nonPageValues = values.filter((v) => v.level !== 'PAGE');
      const winner = this.pickWinner(nonPageValues);

      result[rule.ruleCode] = {
        value: this.parseValue(winner?.value ?? rule.defaultValue, rule.valueType),
        level: winner?.level ?? 'DEFAULT',
        pageOverrides: Object.keys(pageOverrides).length > 0 ? pageOverrides : undefined,
        valueType: rule.valueType,
        label: rule.label,
        category: rule.category,
      };
    }

    return result;
  }

  /**
   * Returns the current cache version for a tenant.
   * Frontend polls this to know when IndexedDB is stale.
   */
  async getCacheVersion(tenantId: string): Promise<{ version: number; lastChangedAt: Date }> {
    const record = await this.prisma.tenantRuleCacheVersion.findUnique({
      where: { tenantId },
    });

    return {
      version: record?.version ?? 0,
      lastChangedAt: record?.lastChangedAt ?? new Date(0),
    };
  }

  /**
   * Bump the cache version so all connected clients know to re-fetch.
   */
  async incrementCacheVersion(tenantId: string, userId: string): Promise<number> {
    const result = await this.prisma.tenantRuleCacheVersion.upsert({
      where: { tenantId },
      update: {
        version: { increment: 1 },
        lastChangedAt: new Date(),
        lastChangedBy: userId,
      },
      create: {
        tenantId,
        version: 1,
        lastChangedAt: new Date(),
        lastChangedBy: userId,
      },
    });

    this.logger.log(`Cache version bumped to ${result.version} for tenant ${tenantId}`);
    return result.version;
  }

  // ───────────────────────── Private helpers ─────────────────────────

  /**
   * From a list of active ControlRoomValue rows, pick the one
   * with the highest level priority. Within RBAC, userId wins over roleId.
   */
  private pickWinner(
    values: Array<{ level: string; userId?: string | null; roleId?: string | null; value: string }>,
  ) {
    if (values.length === 0) return null;

    let best = values[0];
    let bestPriority = this.getLevelPriority(best);

    for (let i = 1; i < values.length; i++) {
      const v = values[i];
      const priority = this.getLevelPriority(v);

      if (priority > bestPriority) {
        best = v;
        bestPriority = priority;
      } else if (priority === bestPriority && v.level === 'RBAC') {
        // userId override beats roleId override within RBAC
        if (v.userId && !best.userId) {
          best = v;
          bestPriority = priority;
        }
      }
    }

    return best;
  }

  private getLevelPriority(v: { level: string; userId?: string | null }): number {
    const base = LEVEL_PRIORITY[v.level] ?? 0;
    // Give userId-based RBAC an extra bump over roleId-based RBAC
    if (v.level === 'RBAC' && v.userId) return base + 0.5;
    return base;
  }

  /**
   * Convert the stored string value to the correct JS type.
   */
  private parseValue(raw: string | null | undefined, valueType: string): any {
    if (raw === null || raw === undefined) return null;

    switch (valueType) {
      case 'BOOLEAN':
        return raw === 'true' || raw === '1';
      case 'NUMBER':
        return Number(raw);
      case 'JSON':
      case 'MULTI_SELECT':
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      default:
        return raw;
    }
  }
}
