import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PlatformConsolePrismaService } from '../../platform-console/prisma/platform-console-prisma.service';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export class UpdateVerticalConfigDto {
  @IsOptional() @IsString() minPlanCode?: string | null;
  @IsOptional() terminology?: Record<string, string>;
  @IsOptional() extraFields?: unknown[];
  @IsOptional() leadStages?: string[];
  @IsOptional() defaultModules?: string[];
}

export interface PartnerVerticalEntry {
  verticalCode: string;
  verticalName: string;
  description: string | null;
  sortOrder: number;
  isEnabled: boolean;
  minPlanCode: string | null;
  terminology: Record<string, string> | null;
  extraFields: unknown[] | null;
  defaultModules: string[] | null;
  leadStages: string[] | null;
}

@Injectable()
export class PartnerVerticalService {
  private readonly logger = new Logger(PartnerVerticalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pcDb: PlatformConsolePrismaService,
  ) {}

  // ── A. List all platform verticals with partner-specific enable flags ───────

  async listPartnerVerticals(partnerCode: string): Promise<PartnerVerticalEntry[]> {
    const [allVerticals, partnerConfigs] = await Promise.all([
      this.prisma.platform.gvCfgVertical.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { code: true, name: true, description: true, sortOrder: true },
      }),
      this.pcDb.pcPartnerVerticalConfig.findMany({
        where: { partnerCode },
      }),
    ]);

    const configMap = new Map(partnerConfigs.map((c) => [c.verticalCode, c]));

    return allVerticals.map((v) => {
      const cfg = configMap.get(v.code);
      return {
        verticalCode: v.code,
        verticalName: v.name,
        description: v.description ?? null,
        sortOrder: v.sortOrder,
        isEnabled: cfg?.isEnabled ?? false,
        minPlanCode: cfg?.minPlanCode ?? null,
        terminology: (cfg?.terminology as Record<string, string>) ?? null,
        extraFields: (cfg?.extraFields as unknown[]) ?? null,
        defaultModules: (cfg?.defaultModules as string[]) ?? null,
        leadStages: (cfg?.leadStages as string[]) ?? null,
      };
    });
  }

  // ── B. Enable a vertical for a partner ──────────────────────────────────────

  async enableVertical(partnerCode: string, verticalCode: string, dto?: UpdateVerticalConfigDto) {
    const vertical = await this.prisma.platform.gvCfgVertical.findUnique({
      where: { code: verticalCode },
    });
    if (!vertical) throw new NotFoundException(`Vertical "${verticalCode}" not found.`);

    const result = await this.pcDb.pcPartnerVerticalConfig.upsert({
      where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
      create: {
        partnerCode,
        verticalCode,
        isEnabled: true,
        minPlanCode: dto?.minPlanCode ?? null,
        terminology: (dto?.terminology ?? undefined) as any,
        extraFields: (dto?.extraFields ?? undefined) as any,
        defaultModules: (dto?.defaultModules ?? undefined) as any,
        leadStages: (dto?.leadStages ?? undefined) as any,
      },
      update: {
        isEnabled: true,
        ...(dto?.minPlanCode !== undefined && { minPlanCode: dto.minPlanCode }),
        ...(dto?.terminology !== undefined && { terminology: dto.terminology as any }),
        ...(dto?.extraFields !== undefined && { extraFields: dto.extraFields as any }),
        ...(dto?.defaultModules !== undefined && { defaultModules: dto.defaultModules as any }),
        ...(dto?.leadStages !== undefined && { leadStages: dto.leadStages as any }),
      },
    });

    this.logger.log(`Partner ${partnerCode}: enabled vertical ${verticalCode}`);
    return result;
  }

  // ── C. Disable a vertical for a partner ─────────────────────────────────────

  async disableVertical(partnerCode: string, verticalCode: string) {
    const existing = await this.pcDb.pcPartnerVerticalConfig.findUnique({
      where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
    });

    if (!existing) {
      // Not configured yet — create as disabled
      return this.pcDb.pcPartnerVerticalConfig.create({
        data: { partnerCode, verticalCode, isEnabled: false },
      });
    }

    const result = await this.pcDb.pcPartnerVerticalConfig.update({
      where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
      data: { isEnabled: false },
    });

    this.logger.log(`Partner ${partnerCode}: disabled vertical ${verticalCode}`);
    return result;
  }

  // ── D. Update config for a specific partner+vertical ────────────────────────

  async updateVerticalConfig(partnerCode: string, verticalCode: string, dto: UpdateVerticalConfigDto) {
    const existing = await this.pcDb.pcPartnerVerticalConfig.findUnique({
      where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
    });
    if (!existing) throw new NotFoundException(`No config for partner ${partnerCode}, vertical ${verticalCode}`);

    return this.pcDb.pcPartnerVerticalConfig.update({
      where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
      data: {
        ...(dto.minPlanCode !== undefined && { minPlanCode: dto.minPlanCode }),
        ...(dto.terminology !== undefined && { terminology: dto.terminology as any }),
        ...(dto.extraFields !== undefined && { extraFields: dto.extraFields as any }),
        ...(dto.defaultModules !== undefined && { defaultModules: dto.defaultModules as any }),
        ...(dto.leadStages !== undefined && { leadStages: dto.leadStages as any }),
      },
    });
  }

  // ── E. Get single vertical config detail ────────────────────────────────────

  async getVerticalConfig(partnerCode: string, verticalCode: string) {
    const [vertical, cfg] = await Promise.all([
      this.prisma.platform.gvCfgVertical.findUnique({ where: { code: verticalCode } }),
      this.pcDb.pcPartnerVerticalConfig.findUnique({
        where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
      }),
    ]);
    if (!vertical) throw new NotFoundException(`Vertical "${verticalCode}" not found.`);

    return {
      verticalCode,
      verticalName: vertical.name,
      description: vertical.description,
      isEnabled: cfg?.isEnabled ?? false,
      minPlanCode: cfg?.minPlanCode ?? null,
      terminology: cfg?.terminology ?? null,
      extraFields: cfg?.extraFields ?? null,
      defaultModules: cfg?.defaultModules ?? null,
      leadStages: cfg?.leadStages ?? null,
    };
  }

  // ── F. Get only enabled verticals for a partner (used by registration/public) ─

  async getEnabledVerticals(partnerCode: string): Promise<{ code: string; name: string; minPlanCode: string | null }[]> {
    const configs = await this.pcDb.pcPartnerVerticalConfig.findMany({
      where: { partnerCode, isEnabled: true },
      select: { verticalCode: true, minPlanCode: true },
    });

    if (configs.length === 0) return [];

    const verticals = await this.prisma.platform.gvCfgVertical.findMany({
      where: { code: { in: configs.map((c) => c.verticalCode) }, isActive: true },
      select: { code: true, name: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    });

    const cfgMap = new Map(configs.map((c) => [c.verticalCode, c]));
    return verticals.map((v) => ({
      code: v.code,
      name: v.name,
      minPlanCode: cfgMap.get(v.code)?.minPlanCode ?? null,
    }));
  }

  // ── G. Check vertical access for a tenant ────────────────────────────────────

  async checkVerticalAccess(
    partnerCode: string,
    verticalCode: string,
    planCode?: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const cfg = await this.pcDb.pcPartnerVerticalConfig.findUnique({
      where: { partnerCode_verticalCode: { partnerCode, verticalCode } },
    });

    if (!cfg?.isEnabled) {
      return { allowed: false, reason: 'Vertical not enabled for this partner' };
    }

    if (cfg.minPlanCode && planCode) {
      const PLAN_TIERS: Record<string, number> = {
        FREE: 0, WL_STARTER: 1, WL_PROFESSIONAL: 2, WL_ENTERPRISE: 3,
      };
      const required = PLAN_TIERS[cfg.minPlanCode] ?? 0;
      const current = PLAN_TIERS[planCode] ?? 0;
      if (current < required) {
        return { allowed: false, reason: `Vertical requires ${cfg.minPlanCode} plan or higher` };
      }
    }

    return { allowed: true };
  }
}
