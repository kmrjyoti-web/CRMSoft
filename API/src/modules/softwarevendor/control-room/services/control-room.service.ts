import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RuleResolverService, RuleResolutionContext } from './rule-resolver.service';

export interface UpdateRuleContext {
  userId: string;
  userName: string;
  ipAddress?: string;
}

export interface AuditQueryOptions {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  level?: string;
  changedByUserId?: string;
}

@Injectable()
export class ControlRoomService {
  private readonly logger = new Logger(ControlRoomService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleResolver: RuleResolverService,
  ) {}

  /**
   * Fetch all rules grouped by category with their current effective values
   * for the given tenant. Used by the Control Room settings UI.
   */
  async getRulesGrouped(tenantId: string) {
    const rules = await this.prisma.controlRoomRule.findMany({
      where: { isActive: true },
      include: {
        values: {
          where: {
            isActive: true,
            OR: [
              { tenantId: null, level: 'INDUSTRY' },
              { tenantId },
            ],
          },
          orderBy: { setAt: 'desc' },
        },
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, any[]> = {};

    for (const rule of rules) {
      if (!grouped[rule.category]) {
        grouped[rule.category] = [];
      }

      // Determine the effective value (highest priority value for this tenant)
      const tenantValues = rule.values.filter(
        (v) => v.tenantId === tenantId || v.tenantId === null,
      );

      // Pick the highest-priority active value
      let effectiveValue = rule.defaultValue;
      let effectiveLevel = 'DEFAULT';

      const levelOrder = ['INDUSTRY', 'WORKING', 'ACCOUNTING', 'INVENTORY', 'CONTROL_ROOM'];
      for (const lvl of levelOrder) {
        const match = tenantValues.find((v) => v.level === lvl);
        if (match) {
          effectiveValue = match.value;
          effectiveLevel = match.level;
        }
      }

      // Collect per-level values for the detail view
      const levelValues: Record<string, { value: string; setBy?: string; setAt?: Date }> = {};
      for (const v of tenantValues) {
        if (!v.pageCode && !v.roleId && !v.userId) {
          levelValues[v.level] = {
            value: v.value,
            setBy: v.setByUserName ?? undefined,
            setAt: v.setAt,
          };
        }
      }

      grouped[rule.category].push({
        id: rule.id,
        ruleCode: rule.ruleCode,
        label: rule.label,
        description: rule.description,
        helpUrl: rule.helpUrl,
        valueType: rule.valueType,
        defaultValue: rule.defaultValue,
        selectOptions: rule.selectOptions,
        minValue: rule.minValue ? Number(rule.minValue) : null,
        maxValue: rule.maxValue ? Number(rule.maxValue) : null,
        allowedLevels: rule.allowedLevels,
        subCategory: rule.subCategory,
        industrySpecific: rule.industrySpecific,
        requiresModule: rule.requiresModule,
        effectiveValue,
        effectiveLevel,
        levelValues,
      });
    }

    return grouped;
  }

  /**
   * Upsert a rule value at the specified level, log the change,
   * and bump the tenant cache version.
   */
  async updateRule(
    tenantId: string,
    ruleCode: string,
    newValue: any,
    level: string,
    context: UpdateRuleContext & { pageCode?: string; roleId?: string; targetUserId?: string; changeReason?: string },
  ) {
    const rule = await this.prisma.controlRoomRule.findUnique({
      where: { ruleCode },
    });

    if (!rule) {
      throw new NotFoundException(`Rule '${ruleCode}' not found`);
    }

    // Validate allowed levels
    const allowedLevels = (rule.allowedLevels as string[]) ?? [];
    if (allowedLevels.length > 0 && !allowedLevels.includes(level)) {
      throw new BadRequestException(
        `Level '${level}' is not allowed for rule '${ruleCode}'. Allowed: ${allowedLevels.join(', ')}`,
      );
    }

    const stringValue = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue);

    // Build the unique constraint fields
    const pageCode = level === 'PAGE' ? (context.pageCode ?? null) : null;
    const roleId = level === 'RBAC' ? (context.roleId ?? null) : null;
    const userId = level === 'RBAC' ? (context.targetUserId ?? null) : null;

    // Determine tenantId for value row (null for INDUSTRY level)
    const valueTenantId = level === 'INDUSTRY' ? null : tenantId;

    // Find existing value for audit trail
    const existing = await this.prisma.controlRoomValue.findFirst({
      where: {
        tenantId: valueTenantId,
        ruleId: rule.id,
        level,
        pageCode,
        roleId,
        userId,
        isActive: true,
      },
    });

    const previousValue = existing?.value ?? null;

    // Use transaction for atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Upsert the value
      const value = existing
        ? await tx.controlRoomValue.update({
            where: { id: existing.id },
            data: {
              value: stringValue,
              setByUserId: context.userId,
              setByUserName: context.userName,
              setAt: new Date(),
            },
          })
        : await tx.controlRoomValue.create({
            data: {
              tenantId: valueTenantId,
              ruleId: rule.id,
              level,
              value: stringValue,
              pageCode,
              roleId,
              userId,
              setByUserId: context.userId,
              setByUserName: context.userName,
              isActive: true,
            },
          });

      // Audit log
      await tx.controlRoomAuditLog.create({
        data: {
          tenantId,
          ruleId: rule.id,
          ruleCode,
          level,
          previousValue,
          newValue: stringValue,
          pageCode,
          roleId,
          userId,
          changedByUserId: context.userId,
          changedByUserName: context.userName,
          changeReason: context.changeReason,
          ipAddress: context.ipAddress,
        },
      });

      return value;
    });

    // Bump cache version outside transaction (non-critical)
    await this.ruleResolver.incrementCacheVersion(tenantId, context.userId);

    this.logger.log(
      `Rule '${ruleCode}' updated at level '${level}' by ${context.userName} (tenant: ${tenantId})`,
    );

    return result;
  }

  /**
   * Fetch audit trail entries, optionally filtered by ruleCode.
   */
  async getAuditTrail(tenantId: string, ruleCode?: string, options?: AuditQueryOptions) {
    const page = options?.page ?? 1;
    const limit = Math.min(options?.limit ?? 50, 200);
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (ruleCode) where.ruleCode = ruleCode;
    if (options?.level) where.level = options.level;
    if (options?.changedByUserId) where.changedByUserId = options.changedByUserId;
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options?.startDate) where.createdAt.gte = options.startDate;
      if (options?.endDate) where.createdAt.lte = options.endDate;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.controlRoomAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.controlRoomAuditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Remove a level's override so the rule reverts to the next lower level.
   */
  async resetRule(
    tenantId: string,
    ruleCode: string,
    level: string,
    context: UpdateRuleContext & { pageCode?: string; roleId?: string; targetUserId?: string; changeReason?: string },
  ) {
    const rule = await this.prisma.controlRoomRule.findUnique({
      where: { ruleCode },
    });

    if (!rule) {
      throw new NotFoundException(`Rule '${ruleCode}' not found`);
    }

    const valueTenantId = level === 'INDUSTRY' ? null : tenantId;
    const pageCode = level === 'PAGE' ? (context.pageCode ?? null) : null;
    const roleId = level === 'RBAC' ? (context.roleId ?? null) : null;
    const userId = level === 'RBAC' ? (context.targetUserId ?? null) : null;

    const existing = await this.prisma.controlRoomValue.findFirst({
      where: {
        tenantId: valueTenantId,
        ruleId: rule.id,
        level,
        pageCode,
        roleId,
        userId,
        isActive: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `No active override found for rule '${ruleCode}' at level '${level}'`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Soft-delete the value
      await tx.controlRoomValue.update({
        where: { id: existing.id },
        data: { isActive: false },
      });

      // Audit log the reset
      await tx.controlRoomAuditLog.create({
        data: {
          tenantId,
          ruleId: rule.id,
          ruleCode,
          level,
          previousValue: existing.value,
          newValue: '__RESET__',
          pageCode,
          roleId,
          userId,
          changedByUserId: context.userId,
          changedByUserName: context.userName,
          changeReason: context.changeReason ?? `Reset level '${level}' override`,
          ipAddress: context.ipAddress,
        },
      });
    });

    await this.ruleResolver.incrementCacheVersion(tenantId, context.userId);

    this.logger.log(
      `Rule '${ruleCode}' reset at level '${level}' by ${context.userName} (tenant: ${tenantId})`,
    );

    return { ruleCode, level, status: 'reset' };
  }

  // ═══════════════════════════════════════
  // DRAFT MODE — save changes without logout
  // ═══════════════════════════════════════

  /** Save a rule change as draft (no logout triggered) */
  async saveDraft(
    tenantId: string,
    ruleCode: string,
    newValue: any,
    level: string,
    context: UpdateRuleContext,
  ) {
    const rule = await this.prisma.controlRoomRule.findUnique({ where: { ruleCode } });
    if (!rule) throw new NotFoundException(`Rule '${ruleCode}' not found`);

    const stringValue = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue);

    // Get current live value
    const existing = await this.prisma.controlRoomValue.findFirst({
      where: { tenantId, ruleId: rule.id, level, isActive: true },
    });

    await this.prisma.controlRoomDraft.upsert({
      where: { tenantId_ruleId_level: { tenantId, ruleId: rule.id, level } },
      create: {
        tenantId, ruleId: rule.id, ruleCode, level,
        previousValue: existing?.value ?? rule.defaultValue,
        newValue: stringValue,
        createdByUserId: context.userId,
        createdByUserName: context.userName,
      },
      update: {
        newValue: stringValue,
        status: 'DRAFT',
      },
    });

    return { ruleCode, newValue, status: 'DRAFT' };
  }

  /** Get all pending drafts */
  async getPendingDrafts(tenantId: string) {
    return this.prisma.controlRoomDraft.findMany({
      where: { tenantId, status: 'DRAFT' },
      include: { rule: { select: { label: true, valueType: true, selectOptions: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Discard a single draft */
  async discardDraft(tenantId: string, draftId: string) {
    await this.prisma.controlRoomDraft.deleteMany({ where: { id: draftId, tenantId, status: 'DRAFT' } });
  }

  /** Discard all drafts */
  async discardAllDrafts(tenantId: string) {
    await this.prisma.controlRoomDraft.deleteMany({ where: { tenantId, status: 'DRAFT' } });
  }

  /** Apply all drafts — ONE transaction, ONE cache bump, ONE logout */
  async applyAllDrafts(
    tenantId: string,
    context: UpdateRuleContext & { changeReason: string },
  ) {
    const drafts = await this.prisma.controlRoomDraft.findMany({
      where: { tenantId, status: 'DRAFT' },
      include: { rule: { select: { label: true } } },
    });

    if (drafts.length === 0) throw new BadRequestException('No pending changes to apply');

    const batchId = drafts[0].id;

    await this.prisma.$transaction(async (tx) => {
      for (const draft of drafts) {
        // Upsert live value
        const existing = await tx.controlRoomValue.findFirst({
          where: { tenantId, ruleId: draft.ruleId, level: draft.level, isActive: true },
        });

        if (existing) {
          await tx.controlRoomValue.update({
            where: { id: existing.id },
            data: { value: draft.newValue, setByUserId: context.userId, setByUserName: context.userName, setAt: new Date() },
          });
        } else {
          await tx.controlRoomValue.create({
            data: {
              tenantId, ruleId: draft.ruleId, level: draft.level,
              value: draft.newValue,
              setByUserId: context.userId, setByUserName: context.userName,
            },
          });
        }

        // Audit log
        await tx.controlRoomAuditLog.create({
          data: {
            tenantId, ruleId: draft.ruleId, ruleCode: draft.ruleCode, level: draft.level,
            previousValue: draft.previousValue, newValue: draft.newValue,
            changedByUserId: context.userId, changedByUserName: context.userName,
            changeReason: context.changeReason, ipAddress: context.ipAddress,
            batchId,
          },
        });

        // Mark draft applied
        await tx.controlRoomDraft.update({
          where: { id: draft.id },
          data: { status: 'APPLIED', appliedAt: new Date() },
        });
      }

      // ONE cache version bump → ONE logout
      await this.ruleResolver.incrementCacheVersion(tenantId, context.userId);
    });

    return {
      appliedCount: drafts.length,
      changes: drafts.map((d) => ({
        ruleCode: d.ruleCode,
        label: d.rule.label,
        previousValue: d.previousValue,
        newValue: d.newValue,
      })),
    };
  }
}
