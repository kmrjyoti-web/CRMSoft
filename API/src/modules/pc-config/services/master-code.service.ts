import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  CreateMasterCodeDto,
  UpdateMasterCodeDto,
  MasterCodeFiltersDto,
  CreateMasterCodeConfigDto,
  UpdateMasterCodeConfigDto,
} from '../presentation/dto/master-code.dto';

@Injectable()
export class MasterCodeService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Master Code CRUD ─────────────────────────────────────────────────────

  async listMasterCodes(filters: MasterCodeFiltersDto = {}) {
    const where: any = { isActive: true };
    if (filters.partnerCode) where.partnerCode = filters.partnerCode;
    if (filters.brandCode) where.brandCode = filters.brandCode;
    if (filters.verticalCode) where.verticalCode = filters.verticalCode;

    const [data, total] = await Promise.all([
      this.prisma.pcMasterCode.findMany({
        where,
        include: { _count: { select: { configs: { where: { isActive: true } } } } },
        orderBy: { masterCode: 'asc' },
      }),
      this.prisma.pcMasterCode.count({ where }),
    ]);

    return { data, total };
  }

  async getMasterCode(id: string) {
    const master = await this.prisma.pcMasterCode.findUnique({
      where: { id },
      include: {
        configs: {
          where: { isActive: true },
          orderBy: { userTypeCode: 'asc' },
        },
      },
    });
    if (!master) throw new NotFoundException(`MasterCode ${id} not found`);
    return master;
  }

  async createMasterCode(dto: CreateMasterCodeDto) {
    const masterCode = this.buildMasterCode(
      dto.partnerCode,
      dto.editionCode,
      dto.brandCode,
      dto.verticalCode,
    );

    const existing = await this.prisma.pcMasterCode.findUnique({ where: { masterCode } });
    if (existing) throw new ConflictException(`MasterCode ${masterCode} already exists`);

    return this.prisma.pcMasterCode.create({
      data: {
        masterCode,
        partnerCode: dto.partnerCode.toUpperCase(),
        editionCode: dto.editionCode.toUpperCase(),
        brandCode: dto.brandCode.toUpperCase(),
        verticalCode: dto.verticalCode.toUpperCase(),
        displayName: dto.displayName,
        description: dto.description,
        commonRegFields: (dto.commonRegFields ?? []) as never,
        commonOnboardingStages: (dto.commonOnboardingStages ?? []) as never,
      },
    });
  }

  async updateMasterCode(id: string, dto: UpdateMasterCodeDto) {
    await this.getMasterCode(id);
    return this.prisma.pcMasterCode.update({
      where: { id },
      data: {
        displayName: dto.displayName,
        description: dto.description,
        commonRegFields: dto.commonRegFields as never,
        commonOnboardingStages: dto.commonOnboardingStages as never,
      },
    });
  }

  async deleteMasterCode(id: string) {
    await this.getMasterCode(id);
    return this.prisma.pcMasterCode.update({ where: { id }, data: { isActive: false } });
  }

  // ── Master Code Config CRUD ──────────────────────────────────────────────

  async listConfigs(masterCodeId: string) {
    await this.getMasterCode(masterCodeId);
    return this.prisma.pcMasterCodeConfig.findMany({
      where: { masterCodeId, isActive: true },
      orderBy: { userTypeCode: 'asc' },
    });
  }

  async createConfig(masterCodeId: string, dto: CreateMasterCodeConfigDto) {
    const master = await this.getMasterCode(masterCodeId);

    const resolvedCode = this.buildResolvedCode(
      dto.userTypeCode,
      master.editionCode,
      master.brandCode,
      dto.subTypeCode,
    );

    const existing = await this.prisma.pcMasterCodeConfig.findUnique({
      where: { resolvedCode },
    });
    if (existing) throw new ConflictException(`Config with resolved code ${resolvedCode} already exists`);

    return this.prisma.pcMasterCodeConfig.create({
      data: {
        masterCodeId,
        userTypeCode: dto.userTypeCode.toUpperCase(),
        subTypeCode: dto.subTypeCode?.toUpperCase() ?? undefined,
        resolvedCode,
        displayName: dto.displayName,
        extraRegFields: (dto.extraRegFields ?? []) as never,
        overrideOnboardingStages: dto.overrideOnboardingStages as never ?? undefined,
      },
    });
  }

  async updateConfig(masterCodeId: string, configId: string, dto: UpdateMasterCodeConfigDto) {
    const config = await this.prisma.pcMasterCodeConfig.findFirst({
      where: { id: configId, masterCodeId },
    });
    if (!config) throw new NotFoundException(`Config ${configId} not found under master ${masterCodeId}`);

    return this.prisma.pcMasterCodeConfig.update({
      where: { id: configId },
      data: {
        displayName: dto.displayName,
        extraRegFields: dto.extraRegFields as never,
        overrideOnboardingStages: dto.overrideOnboardingStages as never ?? undefined,
      },
    });
  }

  async deleteConfig(masterCodeId: string, configId: string) {
    const config = await this.prisma.pcMasterCodeConfig.findFirst({
      where: { id: configId, masterCodeId },
    });
    if (!config) throw new NotFoundException(`Config ${configId} not found under master ${masterCodeId}`);
    return this.prisma.pcMasterCodeConfig.update({ where: { id: configId }, data: { isActive: false } });
  }

  // ── Registration Fields Resolver ─────────────────────────────────────────

  /**
   * Merges commonRegFields from the parent PcMasterCode + extraRegFields from
   * the matching PcMasterCodeConfig. This is the primary method frontends call.
   */
  async getResolvedFields(resolvedCode: string) {
    const config = await this.prisma.pcMasterCodeConfig.findUnique({
      where: { resolvedCode },
      include: { masterCode: true },
    });
    if (!config) throw new NotFoundException(`Resolved code ${resolvedCode} not found`);

    const common = (config.masterCode.commonRegFields as unknown[]) ?? [];
    const extra = (config.extraRegFields as unknown[]) ?? [];

    return {
      resolvedCode: config.resolvedCode,
      masterCode: config.masterCode.masterCode,
      userTypeCode: config.userTypeCode,
      subTypeCode: config.subTypeCode,
      fields: [...common, ...extra],
      onboardingStages:
        config.overrideOnboardingStages ??
        config.masterCode.commonOnboardingStages ??
        [],
    };
  }

  // ── Backward Compatible ──────────────────────────────────────────────────

  /**
   * Finds a config by resolvedCode and returns it with its parent master code.
   * Returns the same shape as the old combined-code API so existing clients
   * don't break during the 30-day deprecation window.
   */
  async getByResolvedCode(code: string) {
    const config = await this.prisma.pcMasterCodeConfig.findUnique({
      where: { resolvedCode: code },
      include: { masterCode: true },
    });
    if (!config) throw new NotFoundException(`Combined code ${code} not found`);
    return {
      id: config.id,
      code: config.resolvedCode,
      displayName: config.displayName,
      userTypeCode: config.userTypeCode,
      subTypeCode: config.subTypeCode,
      registrationFields: [
        ...((config.masterCode.commonRegFields as unknown[]) ?? []),
        ...((config.extraRegFields as unknown[]) ?? []),
      ],
      onboardingStages:
        config.overrideOnboardingStages ??
        config.masterCode.commonOnboardingStages ??
        [],
      masterCode: config.masterCode.masterCode,
      isActive: config.isActive,
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private buildMasterCode(
    partnerCode: string,
    editionCode: string,
    brandCode: string,
    verticalCode: string,
  ): string {
    return [partnerCode, editionCode, brandCode, verticalCode]
      .map((s) => s.toUpperCase())
      .join('_');
  }

  private buildResolvedCode(
    userTypeCode: string,
    editionCode: string,
    brandCode: string,
    subTypeCode?: string,
  ): string {
    const parts = [userTypeCode, editionCode, brandCode];
    if (subTypeCode) parts.push(subTypeCode);
    return parts.map((s) => s.toUpperCase()).join('_');
  }
}
