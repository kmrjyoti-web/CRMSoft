import { Injectable } from '@nestjs/common';
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

  async listSubTypes(verticalCode: string, userType: string) {
    const cacheKey = `config:pc_subtype:${verticalCode}:${userType}`;
    return this.cache.wrap(cacheKey, async () => {
      const vertical = await this.prisma.platform.businessTypeRegistry.findUnique({
        where: { typeCode: verticalCode },
      });
      if (!vertical) return [];

      return this.pcDb.pcSubType.findMany({
        where: { verticalId: vertical.id, userType, isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
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
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════

  async invalidateAll() {
    await this.cache.invalidate('config:*');
  }

  async invalidateTable(tableName: string) {
    await this.cache.invalidate(`config:${tableName}:*`);
  }
}
