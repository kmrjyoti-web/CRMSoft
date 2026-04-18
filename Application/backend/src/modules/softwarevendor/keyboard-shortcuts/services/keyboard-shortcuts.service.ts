import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SHORTCUT_DEFINITIONS } from '../data/shortcut-definitions.data';
import { UpsertOverrideDto, CreateCustomShortcutDto, UpdateDefinitionDto } from '../presentation/dto/shortcut.dto';

@Injectable()
export class KeyboardShortcutsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get all shortcuts merged with user's overrides. */
  async getAllForUser(userId: string, tenantId: string) {
    const definitions = await this.prisma.shortcutDefinition.findMany({
      where: {
        OR: [{ tenantId: '' }, { tenantId }],
        isActive: true,
      },
      include: {
        userOverrides: {
          where: { userId, isActive: true },
        },
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    return definitions.map((def) => {
      const override = def.userOverrides[0];
      return {
        id: def.id,
        code: def.code,
        label: def.label,
        description: def.description,
        category: def.category,
        actionType: def.actionType,
        targetPath: def.targetPath,
        targetModule: def.targetModule,
        targetFunction: def.targetFunction,
        defaultKey: def.defaultKey,
        activeKey: override?.customKey ?? def.defaultKey,
        isCustomized: !!override,
        isLocked: def.isLocked,
        isSystem: def.isSystem,
        sortOrder: def.sortOrder,
      };
    });
  }

  /** Upsert a user's key override for a shortcut. */
  async upsertOverride(userId: string, tenantId: string, shortcutId: string, dto: UpsertOverrideDto) {
    const def = await this.prisma.shortcutDefinition.findUnique({ where: { id: shortcutId } });
    if (!def) throw new BadRequestException('Shortcut not found.');
    if (def.isLocked) throw new BadRequestException('This shortcut is locked by admin and cannot be changed.');

    // Check for key conflicts (same key already used by this user for a different shortcut)
    const conflict = await this.prisma.shortcutUserOverride.findFirst({
      where: {
        tenantId,
        userId,
        customKey: dto.customKey,
        shortcutId: { not: shortcutId },
        isActive: true,
      },
    });
    if (conflict) {
      const conflictDef = await this.prisma.shortcutDefinition.findUnique({ where: { id: conflict.shortcutId } });
      throw new BadRequestException(`Key "${dto.customKey}" is already used by "${conflictDef?.label ?? 'another shortcut'}". Change that shortcut first.`);
    }

    return this.prisma.shortcutUserOverride.upsert({
      where: {
        tenantId_userId_shortcutId: { tenantId, userId, shortcutId },
      },
      update: { customKey: dto.customKey, isActive: true },
      create: { tenantId, userId, shortcutId, customKey: dto.customKey },
    });
  }

  /** Remove a user's override (reset single shortcut to default). */
  async removeOverride(userId: string, tenantId: string, shortcutId: string) {
    await this.prisma.shortcutUserOverride.deleteMany({
      where: { tenantId, userId, shortcutId },
    });
    return { reset: true };
  }

  /** Remove all user overrides (reset all to defaults). */
  async resetAllOverrides(userId: string, tenantId: string) {
    const { count } = await this.prisma.shortcutUserOverride.deleteMany({
      where: { tenantId, userId },
    });
    return { reset: count };
  }

  /** Create a custom shortcut for a user's tenant. */
  async createCustom(userId: string, tenantId: string, dto: CreateCustomShortcutDto) {
    const code = `CUSTOM_${userId.slice(0, 8)}_${Date.now()}`;
    const def = await this.prisma.shortcutDefinition.create({
      data: {
        tenantId,
        code,
        label: dto.label,
        description: dto.description,
        actionType: 'NAVIGATE',
        targetPath: dto.targetPath,
        targetModule: dto.targetModule,
        defaultKey: dto.defaultKey,
        category: dto.category ?? 'CUSTOM',
        isSystem: false,
        isLocked: false,
      },
    });
    // Create user override to bind it to the user
    await this.prisma.shortcutUserOverride.create({
      data: { tenantId, userId, shortcutId: def.id, customKey: dto.defaultKey },
    });
    return def;
  }

  /** Check if a key combo conflicts with existing shortcuts for a user. */
  async checkConflict(userId: string, tenantId: string, key: string, excludeShortcutId?: string) {
    const override = await this.prisma.shortcutUserOverride.findFirst({
      where: {
        tenantId, userId, customKey: key, isActive: true,
        ...(excludeShortcutId ? { shortcutId: { not: excludeShortcutId } } : {}),
      },
      include: { shortcut: { select: { label: true, code: true } } },
    });
    if (override) {
      return { hasConflict: true, conflictsWith: override.shortcut?.label };
    }
    // Check defaults of un-overridden shortcuts
    const defaultMatch = await this.prisma.shortcutDefinition.findFirst({
      where: {
        defaultKey: key,
        isActive: true,
        OR: [{ tenantId: '' }, { tenantId }],
        ...(excludeShortcutId ? { id: { not: excludeShortcutId } } : {}),
        userOverrides: { none: { userId, isActive: true } },
      },
    });
    if (defaultMatch) {
      return { hasConflict: true, conflictsWith: defaultMatch.label };
    }
    return { hasConflict: false, conflictsWith: null };
  }

  // ── ADMIN ──────────────────────────────────────────────────

  /** Admin: get all definitions with override counts. */
  async adminListDefinitions(tenantId: string) {
    return this.prisma.shortcutDefinition.findMany({
      where: { OR: [{ tenantId: '' }, { tenantId }], isActive: true },
      include: { _count: { select: { userOverrides: true } } },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  /** Admin: lock a shortcut. */
  async lockShortcut(id: string) {
    return this.prisma.shortcutDefinition.update({ where: { id }, data: { isLocked: true } });
  }

  /** Admin: unlock a shortcut. */
  async unlockShortcut(id: string) {
    return this.prisma.shortcutDefinition.update({ where: { id }, data: { isLocked: false } });
  }

  /** Admin: update a shortcut definition. */
  async updateDefinition(id: string, dto: UpdateDefinitionDto) {
    return this.prisma.shortcutDefinition.update({ where: { id }, data: dto });
  }

  /** Seed default shortcuts (safe upsert by tenantId+code). */
  async seedDefaults(tenantId = '') {
    let count = 0;
    for (const s of SHORTCUT_DEFINITIONS) {
      await this.prisma.shortcutDefinition.upsert({
        where: { tenantId_code: { tenantId, code: s.code } },
        update: {
          label: s.label,
          description: s.description,
          category: s.category,
          actionType: s.actionType,
          targetPath: s.targetPath,
          targetModule: s.targetModule,
          targetFunction: s.targetFunction,
          defaultKey: s.defaultKey,
          isLocked: s.isLocked ?? false,
          isSystem: s.isSystem ?? false,
          sortOrder: s.sortOrder,
        },
        create: {
          tenantId,
          code: s.code,
          label: s.label,
          description: s.description,
          category: s.category,
          actionType: s.actionType,
          targetPath: s.targetPath,
          targetModule: s.targetModule,
          targetFunction: s.targetFunction,
          defaultKey: s.defaultKey,
          isLocked: s.isLocked ?? false,
          isSystem: s.isSystem ?? false,
          sortOrder: s.sortOrder,
        },
      });
      count++;
    }
    return { seeded: count };
  }
}
