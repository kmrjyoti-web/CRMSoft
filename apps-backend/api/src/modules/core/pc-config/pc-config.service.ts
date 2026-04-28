import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisCacheService } from '../cache/cache.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PlatformConsolePrismaService } from '../../platform-console/prisma/platform-console-prisma.service';

@Injectable()
export class PcConfigService {
  constructor(
    private readonly cache: RedisCacheService,
    private readonly prisma: PrismaService,
    private readonly pcDb: PlatformConsolePrismaService,
  ) {}

  // ═══════════════════════════════════════════
  // PARTNERS
  // ═══════════════════════════════════════════

  async listPartners() {
    return this.cache.wrap('config:pc_partner:all', () =>
      this.pcDb.pcPartner.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    );
  }

  async getPartner(code: string) {
    return this.cache.wrap(`config:pc_partner:${code}`, () =>
      this.pcDb.pcPartner.findUnique({ where: { code } }),
    );
  }

  async createPartner(dto: { code: string; shortCode: string; name: string; ownerEmail: string; description?: string; licenseLevel?: string }) {
    const existing = await this.pcDb.pcPartner.findUnique({ where: { code: dto.code } });
    if (existing) throw new Error(`Partner code '${dto.code}' already exists`);
    const created = await this.pcDb.pcPartner.create({ data: { ...dto, isActive: true } });
    await this.cache.invalidate('config:pc_partner:*');
    return created;
  }

  // ═══════════════════════════════════════════
  // CRM EDITIONS (was "verticals" in gv_cfg_verticals)
  // ═══════════════════════════════════════════

  async listCrmEditions() {
    return this.cache.wrap('config:pc_crm_edition:all', () =>
      this.prisma.identity.gvCfgVertical.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      }),
    );
  }

  async getCrmEdition(code: string) {
    return this.cache.wrap(`config:pc_crm_edition:${code}`, () =>
      this.prisma.identity.gvCfgVertical.findUnique({ where: { code } }),
    );
  }

  async createCrmEdition(dto: { code: string; shortCode?: string; name: string; description?: string }) {
    const existing = await this.prisma.identity.gvCfgVertical.findUnique({ where: { code: dto.code } });
    if (existing) throw new Error(`CRM Edition code '${dto.code}' already exists`);
    const created = await this.prisma.identity.gvCfgVertical.create({ data: { ...dto, isActive: true } });
    await this.cache.invalidate('config:pc_crm_edition:*');
    return created;
  }

  // ═══════════════════════════════════════════
  // BRANDS
  // ═══════════════════════════════════════════

  async listBrands() {
    return this.cache.wrap('config:pc_brand:all', () =>
      this.prisma.identity.gvCfgBrand.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      }),
    );
  }

  async createBrand(dto: { code: string; shortCode?: string; name: string; description?: string; partnerId?: string; layoutFolder?: string; isPublic?: boolean }) {
    const existing = await this.prisma.identity.gvCfgBrand.findUnique({ where: { code: dto.code } });
    if (existing) throw new Error(`Brand code '${dto.code}' already exists`);
    const created = await this.prisma.identity.gvCfgBrand.create({ data: { ...dto, isActive: true } });
    await this.cache.invalidate('config:pc_brand:*');
    return created;
  }

  async getBrand(code: string) {
    return this.cache.wrap(`config:pc_brand:${code}`, async () => {
      const brand = await this.prisma.identity.gvCfgBrand.findUnique({ where: { code } });
      if (!brand) return null;

      const [editions, verticals] = await Promise.all([
        this.pcDb.pcBrandEdition.findMany({ where: { brandId: brand.id } }),
        this.pcDb.pcBrandVertical.findMany({ where: { brandId: brand.id } }),
      ]);

      return { ...brand, editions, verticals };
    });
  }

  // ═══════════════════════════════════════════
  // VERTICALS (industries — was business_type_registry)
  // ═══════════════════════════════════════════

  async createVertical(dto: { typeCode: string; typeName: string; industryCategory: string; crmEditionId?: string; description?: string; shortCode?: string; sortOrder?: number }) {
    const existing = await this.prisma.platform.businessTypeRegistry.findUnique({ where: { typeCode: dto.typeCode } });
    if (existing) throw new Error(`Vertical code '${dto.typeCode}' already exists`);
    const created = await this.prisma.platform.businessTypeRegistry.create({
      data: {
        typeCode: dto.typeCode,
        typeName: dto.typeName,
        industryCategory: dto.industryCategory as any,
        crmEditionId: dto.crmEditionId ?? null,
        description: dto.description ?? null,
        shortCode: dto.shortCode ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: true,
      },
    });
    await this.cache.invalidate('config:pc_vertical:*');
    return created;
  }

  async listVerticals(crmEditionCode?: string) {
    const cacheKey = `config:pc_vertical:${crmEditionCode ?? 'all'}`;
    return this.cache.wrap(cacheKey, async () => {
      if (crmEditionCode) {
        const edition = await this.prisma.identity.gvCfgVertical.findUnique({
          where: { code: crmEditionCode },
        });
        if (!edition) return [];
        return this.prisma.platform.businessTypeRegistry.findMany({
          where: { isActive: true, crmEditionId: edition.id },
          orderBy: { sortOrder: 'asc' },
        });
      }
      return this.prisma.platform.businessTypeRegistry.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  // ═══════════════════════════════════════════
  // SUB-TYPES
  // ═══════════════════════════════════════════

  async listSubTypes(verticalCode: string, userType?: string) {
    const cacheKey = `config:pc_subtype:${verticalCode}:${userType ?? 'all'}`;
    return this.cache.wrap(cacheKey, async () => {
      const vertical = await this.prisma.platform.businessTypeRegistry.findUnique({
        where: { typeCode: verticalCode },
      });
      if (!vertical) return [];

      return this.pcDb.pcSubType.findMany({
        where: { verticalId: vertical.id, ...(userType ? { userType } : {}), isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  async listAllSubTypes() {
    return this.cache.wrap('config:pc_subtype:all', () =>
      this.pcDb.pcSubType.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      }),
    );
  }

  // ── v2.3: Create sub-type ─────────────────────────────────────────────────

  async createSubType(dto: {
    code: string;
    shortCode: string;
    name: string;
    description?: string;
    verticalId: string;
    userType: string;
    allowedBusinessModes: string[];
    defaultBusinessMode?: string;
    businessModeRequired?: boolean;
    sortOrder?: number;
  }) {
    const existing = await this.pcDb.pcSubType.findUnique({ where: { code: dto.code } });
    if (existing) throw new Error(`Sub-type code '${dto.code}' already exists`);

    const created = await this.pcDb.pcSubType.create({
      data: {
        code: dto.code,
        shortCode: dto.shortCode,
        name: dto.name,
        description: dto.description ?? null,
        verticalId: dto.verticalId,
        userType: dto.userType,
        allowedBusinessModes: dto.allowedBusinessModes,
        defaultBusinessMode: dto.defaultBusinessMode ?? null,
        businessModeRequired: dto.businessModeRequired ?? true,
        sortOrder: dto.sortOrder ?? 0,
        isActive: true,
      },
    });

    await this.cache.invalidate('config:pc_subtype:*');
    return created;
  }

  async updateSubType(id: string, dto: {
    name?: string; shortCode?: string; description?: string;
    userType?: string;
    allowedBusinessModes?: string[];
    defaultBusinessMode?: string | null;
    businessModeRequired?: boolean;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const updated = await this.pcDb.pcSubType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.shortCode !== undefined && { shortCode: dto.shortCode }),
        ...(dto.description !== undefined && { description: dto.description ?? null }),
        ...(dto.userType !== undefined && { userType: dto.userType }),
        ...(dto.allowedBusinessModes !== undefined && { allowedBusinessModes: dto.allowedBusinessModes }),
        ...(dto.defaultBusinessMode !== undefined && { defaultBusinessMode: dto.defaultBusinessMode }),
        ...(dto.businessModeRequired !== undefined && { businessModeRequired: dto.businessModeRequired }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    await this.cache.invalidate('config:pc_subtype:*');
    return updated;
  }

  async deleteSubType(id: string) {
    await this.pcDb.pcSubType.update({ where: { id }, data: { isActive: false } });
    await this.cache.invalidate('config:pc_subtype:*');
  }

  async listAllSubTypesAdmin() {
    return this.pcDb.pcSubType.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  // ═══════════════════════════════════════════
  // SUBSCRIPTION PLANS (WL platform plans)
  // ═══════════════════════════════════════════

  async listSubscriptionPlans(activeOnly = true) {
    return this.cache.wrap(`config:sub_plan:all:${activeOnly}`, () =>
      this.prisma.platform.subscriptionPackage.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: 'asc' },
      }),
    );
  }

  async getSubscriptionPlan(packageCode: string) {
    return this.cache.wrap(`config:sub_plan:${packageCode}`, () =>
      this.prisma.platform.subscriptionPackage.findUnique({ where: { packageCode } }),
    );
  }

  async createSubscriptionPlan(dto: {
    packageCode: string;
    packageName: string;
    tagline?: string;
    description?: string;
    tier?: number;
    priceMonthlyInr: number;
    priceYearlyInr: number;
    trialDays?: number;
    entityLimits?: Record<string, unknown>;
    featureFlags?: Record<string, unknown>;
    hasDedicatedDb?: boolean;
    isPublic?: boolean;
    sortOrder?: number;
  }) {
    const existing = await this.prisma.platform.subscriptionPackage.findUnique({
      where: { packageCode: dto.packageCode },
    });
    if (existing) throw new Error(`Plan code '${dto.packageCode}' already exists`);
    const created = await this.prisma.platform.subscriptionPackage.create({
      data: {
        packageCode: dto.packageCode,
        packageName: dto.packageName,
        tagline: dto.tagline,
        description: dto.description,
        tier: dto.tier ?? 0,
        priceMonthlyInr: dto.priceMonthlyInr,
        priceYearlyInr: dto.priceYearlyInr,
        yearlyDiscountPct: 20,
        trialDays: dto.trialDays ?? 14,
        entityLimits: (dto.entityLimits ?? {}) as any,
        featureFlags: (dto.featureFlags ?? {}) as any,
        hasDedicatedDb: dto.hasDedicatedDb ?? false,
        isPublic: dto.isPublic ?? true,
        isActive: true,
        sortOrder: dto.sortOrder ?? 0,
        applicableTypes: ['ALL'] as any,
        includedModules: [] as any,
        limits: {} as any,
        planLevel: dto.tier ?? 0,
      },
    });
    await this.cache.invalidate('config:sub_plan:*');
    return created;
  }

  async updateSubscriptionPlan(packageCode: string, dto: {
    packageName?: string;
    tagline?: string;
    description?: string;
    priceMonthlyInr?: number;
    priceYearlyInr?: number;
    trialDays?: number;
    entityLimits?: Record<string, unknown>;
    featureFlags?: Record<string, unknown>;
    hasDedicatedDb?: boolean;
    isActive?: boolean;
    isPublic?: boolean;
    sortOrder?: number;
  }) {
    const patch: Record<string, unknown> = {};
    if (dto.packageName !== undefined) patch.packageName = dto.packageName;
    if (dto.tagline !== undefined) patch.tagline = dto.tagline;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.priceMonthlyInr !== undefined) patch.priceMonthlyInr = dto.priceMonthlyInr;
    if (dto.priceYearlyInr !== undefined) patch.priceYearlyInr = dto.priceYearlyInr;
    if (dto.trialDays !== undefined) patch.trialDays = dto.trialDays;
    if (dto.entityLimits !== undefined) patch.entityLimits = dto.entityLimits;
    if (dto.featureFlags !== undefined) patch.featureFlags = dto.featureFlags;
    if (dto.hasDedicatedDb !== undefined) patch.hasDedicatedDb = dto.hasDedicatedDb;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.isPublic !== undefined) patch.isPublic = dto.isPublic;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    const updated = await this.prisma.platform.subscriptionPackage.update({
      where: { packageCode },
      data: patch as any,
    });
    await this.cache.invalidate('config:sub_plan:*');
    return updated;
  }

  // ── v2.3: Code suggestion ─────────────────────────────────────────────────

  async suggestCode(name: string, type: 'partner' | 'brand' | 'edition' | 'vertical' | 'subtype') {
    const tableMap = {
      partner:  () => this.pcDb.pcPartner.findMany({ select: { code: true } }),
      brand:    () => this.prisma.identity.gvCfgBrand.findMany({ select: { code: true } }),
      edition:  () => this.prisma.identity.gvCfgVertical.findMany({ select: { code: true } }),
      vertical: () => this.prisma.platform.businessTypeRegistry.findMany({ select: { typeCode: true } }).then((r) => r.map((x) => ({ code: x.typeCode }))),
      subtype:  () => this.pcDb.pcSubType.findMany({ select: { code: true } }),
    };

    const rows = await tableMap[type]();
    const existing = rows.map((r: any) => (r.code as string).toUpperCase());

    const primary = name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const abbrev  = name.split(/\s+/).map((w) => w[0]).filter(Boolean).join('').toUpperCase();
    const first   = name.split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g, '');

    const candidates = [...new Set([primary, abbrev, first].filter(Boolean))];

    for (const c of candidates) {
      if (!existing.includes(c)) {
        return { suggested: c, alternatives: candidates.filter((x) => x !== c), isUnique: true };
      }
    }

    let n = 2;
    while (existing.includes(`${primary}_${n}`)) n++;
    return { suggested: `${primary}_${n}`, alternatives: [`${abbrev}_${n}`], isUnique: true };
  }

  // ═══════════════════════════════════════════
  // COMBINED CODES
  // ═══════════════════════════════════════════

  async getCombinedCode(code: string) {
    return this.cache.wrap(`config:pc_combined_code:${code}`, () =>
      this.pcDb.pcCombinedCode.findUnique({ where: { code } }),
    );
  }

  async listCombinedCodesForBrand(brandCode: string) {
    return this.cache.wrap(`config:pc_combined_code:brand:${brandCode}`, async () => {
      const brand = await this.prisma.identity.gvCfgBrand.findUnique({ where: { code: brandCode } });
      if (!brand) return [];
      return this.pcDb.pcCombinedCode.findMany({ where: { brandId: brand.id, isActive: true } });
    });
  }

  // ═══════════════════════════════════════════
  // PAGE ACCESS (RBAC)
  // ═══════════════════════════════════════════

  async getPageAccess(combinedCode: string, pageCode: string) {
    return this.cache.wrap(`config:pc_page_access:${combinedCode}:${pageCode}`, async () => {
      const [cc, page] = await Promise.all([
        this.getCombinedCode(combinedCode),
        this.prisma.platform.pageRegistry.findFirst({ where: { pageCode } }),
      ]);
      if (!cc || !page) return null;

      return this.pcDb.pcPageAccess.findFirst({
        where: { combinedCodeId: (cc as any).id, pageRegistryId: page.id },
      });
    });
  }

  async listAccessibleMenus(combinedCode: string) {
    return this.cache.wrap(`config:menus:${combinedCode}`, async () => {
      const cc = await this.getCombinedCode(combinedCode);
      if (!cc) return [];

      const accesses = await this.pcDb.pcPageAccess.findMany({
        where: { combinedCodeId: (cc as any).id, isEnabled: true, canRead: true },
      });

      if (accesses.length === 0) return [];

      const pageIds = accesses.map((a) => a.pageRegistryId);
      return this.prisma.platform.pageRegistry.findMany({
        where: { id: { in: pageIds }, isActive: true, showInMenu: true },
        orderBy: { menuSortOrder: 'asc' },
      });
    });
  }

  // ═══════════════════════════════════════════
  // ONBOARDING STAGES
  // ═══════════════════════════════════════════

  async getOnboardingStages(combinedCode?: string) {
    const cacheKey = `config:onboarding_stages:${combinedCode ?? 'global'}`;
    return this.cache.wrap(cacheKey, async () => {
      // Global stages (combinedCodeId = null)
      const global = await this.pcDb.pcOnboardingStage.findMany({
        where: { combinedCodeId: null, isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      if (!combinedCode) return global;

      const cc = await this.getCombinedCode(combinedCode);
      if (!cc) return global;

      const specific = await this.pcDb.pcOnboardingStage.findMany({
        where: { combinedCodeId: (cc as any).id, isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      // Specific stages override global if present
      return specific.length > 0 ? specific : global;
    });
  }

  // ═══════════════════════════════════════════
  // REGISTRATION FIELDS
  // ═══════════════════════════════════════════

  async getRegistrationFields(combinedCode: string) {
    return this.cache.wrap(`config:registration_fields:${combinedCode}`, async () => {
      const cc = await this.getCombinedCode(combinedCode);
      if (!cc) return [];

      return this.pcDb.pcRegistrationField.findMany({
        where: { combinedCodeId: (cc as any).id, isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  async listRegistrationFieldsAdmin(combinedCode: string) {
    const cc = await this.getCombinedCode(combinedCode);
    if (!cc) return [];
    return this.pcDb.pcRegistrationField.findMany({
      where: { combinedCodeId: (cc as any).id, onboardingStageId: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createRegistrationField(dto: {
    combinedCode: string;
    fieldKey: string; fieldType: string; label: string;
    placeholder?: string | null; helpText?: string | null;
    required?: boolean; options?: any; validation?: any;
    showWhen?: any; sortOrder?: number;
  }) {
    const cc = await this.getCombinedCode(dto.combinedCode);
    if (!cc) throw new NotFoundException(`Combined code ${dto.combinedCode} not found`);
    const combinedCodeId = (cc as any).id;
    const max = await this.pcDb.pcRegistrationField.aggregate({
      where: { combinedCodeId },
      _max: { sortOrder: true },
    });
    const field = await this.pcDb.pcRegistrationField.create({
      data: {
        combinedCodeId,
        fieldKey: dto.fieldKey,
        fieldType: dto.fieldType,
        label: dto.label,
        placeholder: dto.placeholder ?? null,
        helpText: dto.helpText ?? null,
        required: dto.required ?? false,
        options: dto.options ?? null,
        validation: dto.validation ?? null,
        showWhen: dto.showWhen ?? null,
        sortOrder: dto.sortOrder ?? ((max._max.sortOrder ?? 0) + 10),
        isActive: true,
        translations: {},
      },
    });
    await this.cache.invalidate(`config:registration_fields:*`);
    return field;
  }

  async updateRegistrationField(id: string, dto: {
    label?: string; placeholder?: string | null; helpText?: string | null;
    required?: boolean; options?: any; validation?: any; showWhen?: any;
    fieldType?: string;
  }) {
    const field = await this.pcDb.pcRegistrationField.update({
      where: { id },
      data: dto,
    });
    await this.cache.invalidate(`config:registration_fields:*`);
    return field;
  }

  async toggleRegistrationField(id: string) {
    const current = await this.pcDb.pcRegistrationField.findUnique({ where: { id } });
    if (!current) throw new NotFoundException(`Field ${id} not found`);
    const updated = await this.pcDb.pcRegistrationField.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    await this.cache.invalidate(`config:registration_fields:*`);
    return updated;
  }

  async reorderRegistrationFields(fieldIds: string[]) {
    for (let i = 0; i < fieldIds.length; i++) {
      await this.pcDb.pcRegistrationField.update({
        where: { id: fieldIds[i] },
        data: { sortOrder: (i + 1) * 10 },
      });
    }
    await this.cache.invalidate(`config:registration_fields:*`);
  }

  async deleteRegistrationField(id: string) {
    await this.pcDb.pcRegistrationField.update({
      where: { id },
      data: { isActive: false },
    });
    await this.cache.invalidate(`config:registration_fields:*`);
  }

  async toggleFieldRequired(id: string) {
    const current = await this.pcDb.pcRegistrationField.findUnique({ where: { id } });
    if (!current) throw new NotFoundException(`Field ${id} not found`);
    const updated = await this.pcDb.pcRegistrationField.update({
      where: { id },
      data: { required: !current.required },
    });
    await this.cache.invalidate(`config:registration_fields:*`);
    return updated;
  }

  async toggleFieldVisibility(id: string) {
    const current = await this.pcDb.pcRegistrationField.findUnique({ where: { id } });
    if (!current) throw new NotFoundException(`Field ${id} not found`);
    const updated = await this.pcDb.pcRegistrationField.update({
      where: { id },
      data: { visibility: (current as any).visibility === 'hidden' ? 'visible' : 'hidden' },
    });
    await this.cache.invalidate(`config:registration_fields:*`);
    return updated;
  }

  async listStageFields(stageId: string) {
    return this.pcDb.pcRegistrationField.findMany({
      where: { onboardingStageId: stageId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async addFieldToStage(dto: {
    stageId: string; combinedCodeId: string;
    fieldKey: string; fieldType: string; label: string;
    placeholder?: string | null; helpText?: string | null; required?: boolean;
  }) {
    const max = await this.pcDb.pcRegistrationField.aggregate({
      where: { onboardingStageId: dto.stageId },
      _max: { sortOrder: true },
    });
    const field = await this.pcDb.pcRegistrationField.create({
      data: {
        combinedCodeId: dto.combinedCodeId,
        onboardingStageId: dto.stageId,
        fieldKey: dto.fieldKey,
        fieldType: dto.fieldType,
        label: dto.label,
        placeholder: dto.placeholder ?? null,
        helpText: dto.helpText ?? null,
        required: dto.required ?? false,
        sortOrder: (max._max.sortOrder ?? 0) + 10,
        isActive: true,
        translations: {},
      },
    });
    await this.cache.invalidate(`config:registration_fields:*`);
    return field;
  }

  async moveFieldToStage(fieldId: string, newStageId: string | null) {
    const updated = await this.pcDb.pcRegistrationField.update({
      where: { id: fieldId },
      data: { onboardingStageId: newStageId },
    });
    await this.cache.invalidate(`config:registration_fields:*`);
    return updated;
  }

  // ═══════════════════════════════════════════
  // PAGE REGISTRY
  // ═══════════════════════════════════════════

  async listPageRegistry(portal?: string) {
    const cacheKey = `config:pc_page_registry:${portal ?? 'all'}`;
    return this.cache.wrap(cacheKey, () =>
      this.prisma.platform.pageRegistry.findMany({
        where: { isActive: true, ...(portal ? { portal } : {}) },
        select: {
          id: true, pageCode: true, routePath: true, portal: true,
          friendlyName: true, category: true, moduleCode: true,
          pageType: true, isDemoReady: true, isActive: true,
        },
        orderBy: [{ portal: 'asc' }, { routePath: 'asc' }],
      }),
    );
  }

  // ═══════════════════════════════════════════
  // COMBINED CODES LIST
  // ═══════════════════════════════════════════

  async listCombinedCodes(brandCode?: string) {
    const cacheKey = `config:pc_combined_code:list:${brandCode ?? 'all'}`;
    return this.cache.wrap(cacheKey, async () => {
      if (brandCode) {
        return this.listCombinedCodesForBrand(brandCode);
      }
      return this.pcDb.pcCombinedCode.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      });
    });
  }

  // ── M3: Create combined code ──────────────────────────────────────────────

  async createCombinedCode(dto: {
    code: string;
    partnerId: string;
    brandId: string;
    crmEditionId: string;
    verticalId: string;
    userType: string;
    subTypeId: string;
    displayName: string;
    description?: string;
    businessModes?: string[];
  }) {
    const existing = await this.pcDb.pcCombinedCode.findUnique({ where: { code: dto.code } });
    if (existing) throw new Error(`Combined code '${dto.code}' already exists`);

    const created = await this.pcDb.pcCombinedCode.create({
      data: {
        code: dto.code,
        partnerId: dto.partnerId,
        brandId: dto.brandId,
        crmEditionId: dto.crmEditionId,
        verticalId: dto.verticalId,
        userType: dto.userType,
        subTypeId: dto.subTypeId,
        displayName: dto.displayName,
        description: dto.description ?? null,
        businessModes: dto.businessModes ?? [],
        modulesEnabled: [],
        marketplaceRules: {},
        isActive: true,
      },
    });

    // Bust relevant cache entries so subsequent reads see the new row
    await this.cache.invalidate('config:pc_combined_code:list:*');
    await this.cache.invalidate(`config:pc_combined_code:brand:${dto.brandId}`);

    return created;
  }

  // ═══════════════════════════════════════════
  // M7: PAGE ACCESS (per combined-code)
  // ═══════════════════════════════════════════

  async getMyAccess(combinedCode: string | null) {
    if (!combinedCode) {
      return { combinedCode: null, allowAll: true, pages: [] };
    }

    const cacheKey = `config:pc_page_access:${combinedCode}`;
    return this.cache.wrap(cacheKey, async () => {
      const cc = await this.pcDb.pcCombinedCode.findFirst({ where: { code: combinedCode } });
      if (!cc) return { combinedCode, allowAll: true, pages: [] };

      const rules = await this.pcDb.pcPageAccess.findMany({
        where: { combinedCodeId: cc.id, isEnabled: true },
        select: {
          pageRegistryId: true,
          canRead: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true,
          canExport: true,
        },
      });

      return { combinedCode, allowAll: false, pages: rules };
    });
  }

  // ═══════════════════════════════════════════
  // ONBOARDING STAGE MANAGEMENT (admin CRUD)
  // ═══════════════════════════════════════════

  async listOnboardingStagesAdmin(combinedCode?: string) {
    if (!combinedCode) {
      return this.pcDb.pcOnboardingStage.findMany({ orderBy: { sortOrder: 'asc' } });
    }
    const cc = await this.pcDb.pcCombinedCode.findFirst({ where: { code: combinedCode } });
    const rows = await this.pcDb.pcOnboardingStage.findMany({
      where: {
        OR: [
          { combinedCodeId: null },
          { combinedCodeId: cc?.id ?? '__none__' },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
    // Deduplicate: code-specific override wins over global for same stageKey
    const seen = new Map<string, typeof rows[0]>();
    for (const row of rows) {
      const existing = seen.get(row.stageKey);
      if (!existing || (row.combinedCodeId && !existing.combinedCodeId)) {
        seen.set(row.stageKey, row);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createOnboardingStage(dto: {
    stageKey: string; stageLabel: string; componentName: string;
    required?: boolean; sortOrder?: number; combinedCodeId?: string | null;
    skipIfFieldSet?: string | null; translations?: Record<string, any>;
  }) {
    const max = await this.pcDb.pcOnboardingStage.aggregate({
      where: { combinedCodeId: dto.combinedCodeId ?? null },
      _max: { sortOrder: true },
    });
    const stage = await this.pcDb.pcOnboardingStage.create({
      data: {
        ...dto,
        sortOrder: dto.sortOrder ?? ((max._max.sortOrder ?? 0) + 10),
        isActive: true,
      },
    });
    await this.cache.invalidate('config:onboarding_stages:*');
    return stage;
  }

  async updateOnboardingStage(id: string, dto: {
    stageLabel?: string; componentName?: string; required?: boolean;
    skipIfFieldSet?: string | null; translations?: Record<string, any>;
  }) {
    const stage = await this.pcDb.pcOnboardingStage.update({
      where: { id },
      data: dto,
    });
    await this.cache.invalidate('config:onboarding_stages:*');
    return stage;
  }

  async toggleOnboardingStage(id: string) {
    const current = await this.pcDb.pcOnboardingStage.findUnique({ where: { id } });
    if (!current) throw new NotFoundException(`Stage ${id} not found`);
    const updated = await this.pcDb.pcOnboardingStage.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    await this.cache.invalidate('config:onboarding_stages:*');
    return updated;
  }

  async reorderOnboardingStages(stageIds: string[]) {
    for (let i = 0; i < stageIds.length; i++) {
      await this.pcDb.pcOnboardingStage.update({
        where: { id: stageIds[i] },
        data: { sortOrder: (i + 1) * 10 },
      });
    }
    await this.cache.invalidate('config:onboarding_stages:*');
  }

  async deleteOnboardingStage(id: string) {
    await this.pcDb.pcOnboardingStage.update({
      where: { id },
      data: { isActive: false },
    });
    await this.cache.invalidate('config:onboarding_stages:*');
  }

  // ═══════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════

  async invalidateAll() {
    await this.cache.invalidate('config:*');
  }

  async invalidateTable(tableName: string) {
    await this.cache.invalidate(`config:${tableName}:*`);
  }
}
