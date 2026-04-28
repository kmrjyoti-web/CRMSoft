import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RedisCacheService } from '../../core/cache/cache.service';
import { randomUUID } from 'crypto';

const PUBLIC_CONFIG_TTL = 300; // 5 minutes

@Injectable()
export class BrandConfigService {
  private readonly logger = new Logger(BrandConfigService.name);

  constructor(
    private readonly db: PlatformConsolePrismaService,
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  // ─── Public brand config endpoint ────────────────────────────────────────

  /**
   * Resolves and merges brand config for a domain.
   * Returns raw config + routing hints (_domain) for the controller to use.
   * The controller is responsible for signing, encrypting, and caching.
   */
  async getRawBrandConfig(domain: string): Promise<{
    _domain: { tenantId: string; domain: string | null; subdomain: string | null };
    tenant: object; brand: object | null;
    combinedCodes: object[]; registrationFields: object[];
    onboardingStages: object[]; plan: object;
  }> {
    const cacheKey = `brand-config:raw:${domain.toLowerCase()}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    // 1. Resolve tenant from domain or subdomain
    const tenant = await this.prisma.identity.tenant.findFirst({
      where: { OR: [{ domain: domain.toLowerCase() }, { subdomain: domain.toLowerCase() }] },
      select: {
        id: true, slug: true, name: true,
        domain: true, subdomain: true,
        brandCode: true, editionCode: true, verticalCode: true,
        partnerCode: true, planCode: true,
        subscriptionStatus: true,
      },
    });

    if (!tenant || !tenant.brandCode) {
      throw new HttpException('No tenant configured for this domain', HttpStatus.NOT_FOUND);
    }

    // 2. Load brand profile from PlatformConsoleDB
    const brandProfile = await this.db.brandProfile.findUnique({
      where: { brandCode: tenant.brandCode },
    });

    // 3. Load registration fields for the combined codes that match this brand
    // brandId in PcCombinedCode stores the brand code string (not a UUID)
    const combinedCodes = await this.db.pcCombinedCode.findMany({
      where: { brandId: tenant.brandCode, isActive: true },
      orderBy: { code: 'asc' },
    });

    const regFields = combinedCodes.length > 0
      ? await this.db.pcRegistrationField.findMany({
          where: {
            combinedCodeId: { in: combinedCodes.map((c) => c.id) },
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        })
      : [];

    // 4. Load onboarding stages
    const stages = await this.db.pcOnboardingStage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // 5. Load plan feature flags (if planCode is set)
    let planFeatures: Record<string, unknown> = {};
    if (tenant.planCode) {
      const plan = await this.prisma.platform.subscriptionPackage.findUnique({
        where: { packageCode: tenant.planCode },
        select: { packageCode: true, packageName: true, featureFlags: true, entityLimits: true },
      });
      if (plan) {
        planFeatures = {
          planCode: plan.packageCode,
          planName: plan.packageName,
          featureFlags: plan.featureFlags,
          entityLimits: plan.entityLimits,
        };
      }
    }

    const result = {
      _domain: { tenantId: tenant.id, domain: tenant.domain, subdomain: tenant.subdomain },
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        editionCode: tenant.editionCode,
        verticalCode: tenant.verticalCode,
        partnerCode: tenant.partnerCode,
        subscriptionStatus: tenant.subscriptionStatus,
      },
      brand: brandProfile
        ? {
            brandCode: brandProfile.brandCode,
            brandName: brandProfile.brandName,
            displayName: brandProfile.displayName,
            logoUrl: brandProfile.logoUrl,
            primaryColor: brandProfile.primaryColor,
            secondaryColor: brandProfile.secondaryColor,
            contactEmail: brandProfile.contactEmail,
          }
        : null,
      combinedCodes: combinedCodes.map((c) => ({
        id: c.id,
        code: c.code,
        displayName: c.displayName,
        userType: c.userType,
      })),
      registrationFields: regFields,
      onboardingStages: stages,
      plan: planFeatures,
    };

    await this.cache.set(cacheKey, result, PUBLIC_CONFIG_TTL);
    return result;
  }

  /** @deprecated use getRawBrandConfig — kept for backward compat */
  async getPublicBrandConfig(domain: string) {
    return this.getRawBrandConfig(domain);
  }

  // ─── Brand Profiles ──────────────────────────────────────────────────────

  async listBrands() {
    const brands = await this.db.brandProfile.findMany({ orderBy: { createdAt: 'desc' } });
    const results = await Promise.all(
      brands.map(async (b) => {
        const enabledCount = await this.db.pc_brand_vertical_config.count({
          where: { brand_code: b.brandCode, is_enabled: true },
        });
        return { ...b, enabledVerticalCount: enabledCount };
      }),
    );
    return results;
  }

  async getBrand(id: string) {
    const brand = await this.db.brandProfile.findUnique({ where: { id } });
    if (!brand) throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
    return brand;
  }

  async createBrand(data: {
    brandCode: string;
    brandName: string;
    displayName: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    domain?: string;
    subdomain?: string;
    contactEmail?: string;
  }) {
    const existing = await this.db.brandProfile.findUnique({ where: { brandCode: data.brandCode } });
    if (existing) {
      throw new HttpException(`Brand code '${data.brandCode}' already exists`, HttpStatus.CONFLICT);
    }
    return this.db.brandProfile.create({ data });
  }

  async updateBrand(id: string, data: Record<string, unknown>) {
    const allowed = [
      'brandName', 'displayName', 'description', 'primaryColor', 'secondaryColor',
      'logoUrl', 'domain', 'subdomain', 'contactEmail', 'isActive', 'isDefault',
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    return this.db.brandProfile.update({ where: { id }, data: update });
  }

  // ─── Vertical Assignments ─────────────────────────────────────────────────

  async getVerticalsForBrand(brandId: string) {
    const brand = await this.db.brandProfile.findUnique({ where: { id: brandId } });
    if (!brand) throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);

    const verticals = await this.db.pc_vertical_v2.findMany({
      orderBy: { sort_order: 'asc' },
      include: {
        pc_vertical_module: { orderBy: { sort_order: 'asc' } },
        pc_vertical_menu: { orderBy: { sort_order: 'asc' } },
        pc_vertical_feature: { orderBy: { sort_order: 'asc' } },
      },
    });

    const configs = await this.db.pc_brand_vertical_config.findMany({
      where: { brand_code: brand.brandCode },
    });
    const configMap = new Map(configs.map((c) => [c.vertical_id, c]));

    return verticals.map((v) => {
      const cfg = configMap.get(v.id) ?? null;
      return {
        ...v,
        brand_config: cfg,
        is_enabled_for_brand: cfg?.is_enabled ?? false,
      };
    });
  }

  async enableVerticalForBrand(brandId: string, verticalCode: string) {
    const [brand, vertical] = await Promise.all([
      this.db.brandProfile.findUnique({ where: { id: brandId } }),
      this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } }),
    ]);
    if (!brand) throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    const existing = await this.db.pc_brand_vertical_config.findUnique({
      where: { brand_code_vertical_id: { brand_code: brand.brandCode, vertical_id: vertical.id } },
    });

    if (existing) {
      return this.db.pc_brand_vertical_config.update({
        where: { brand_code_vertical_id: { brand_code: brand.brandCode, vertical_id: vertical.id } },
        data: { is_enabled: true, updated_at: new Date() },
      });
    }

    return this.db.pc_brand_vertical_config.create({
      data: {
        id: randomUUID(),
        brand_code: brand.brandCode,
        vertical_id: vertical.id,
        is_enabled: true,
        updated_at: new Date(),
      },
    });
  }

  async disableVerticalForBrand(brandId: string, verticalCode: string) {
    const [brand, vertical] = await Promise.all([
      this.db.brandProfile.findUnique({ where: { id: brandId } }),
      this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } }),
    ]);
    if (!brand) throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    const existing = await this.db.pc_brand_vertical_config.findUnique({
      where: { brand_code_vertical_id: { brand_code: brand.brandCode, vertical_id: vertical.id } },
    });
    if (!existing) return { message: 'Not mapped' };

    return this.db.pc_brand_vertical_config.update({
      where: { brand_code_vertical_id: { brand_code: brand.brandCode, vertical_id: vertical.id } },
      data: { is_enabled: false, updated_at: new Date() },
    });
  }

  async updateBrandVerticalOverrides(brandId: string, verticalCode: string, updates: {
    disabled_modules?: string[];
    hidden_menus?: string[];
    disabled_features?: string[];
    custom_price?: number | null;
    custom_per_user_price?: number | null;
    custom_name?: string | null;
    custom_description?: string | null;
    custom_color?: string | null;
  }) {
    const [brand, vertical] = await Promise.all([
      this.db.brandProfile.findUnique({ where: { id: brandId } }),
      this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } }),
    ]);
    if (!brand) throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    const data: Record<string, unknown> = { updated_at: new Date() };
    if (updates.disabled_modules !== undefined) data.disabled_modules = updates.disabled_modules;
    if (updates.hidden_menus !== undefined) data.hidden_menus = updates.hidden_menus;
    if (updates.disabled_features !== undefined) data.disabled_features = updates.disabled_features;
    if (updates.custom_price !== undefined) data.custom_price = updates.custom_price;
    if (updates.custom_per_user_price !== undefined) data.custom_per_user_price = updates.custom_per_user_price;
    if (updates.custom_name !== undefined) data.custom_name = updates.custom_name;
    if (updates.custom_description !== undefined) data.custom_description = updates.custom_description;
    if (updates.custom_color !== undefined) data.custom_color = updates.custom_color;

    const existing = await this.db.pc_brand_vertical_config.findUnique({
      where: { brand_code_vertical_id: { brand_code: brand.brandCode, vertical_id: vertical.id } },
    });

    if (existing) {
      return this.db.pc_brand_vertical_config.update({
        where: { brand_code_vertical_id: { brand_code: brand.brandCode, vertical_id: vertical.id } },
        data,
      });
    }

    return this.db.pc_brand_vertical_config.create({
      data: {
        id: randomUUID(),
        brand_code: brand.brandCode,
        vertical_id: vertical.id,
        is_enabled: true,
        updated_at: new Date(),
        ...data,
      },
    });
  }

  async getEffectiveConfig(brandId: string, verticalCode: string) {
    const [brand, vertical] = await Promise.all([
      this.db.brandProfile.findUnique({ where: { id: brandId } }),
      this.db.pc_vertical_v2.findUnique({
        where: { vertical_code: verticalCode },
        include: {
          pc_vertical_module: { orderBy: { sort_order: 'asc' } },
          pc_vertical_menu: { orderBy: { sort_order: 'asc' } },
          pc_vertical_feature: { orderBy: { sort_order: 'asc' } },
        },
      }),
    ]);
    if (!brand) throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    const cfg = await this.db.pc_brand_vertical_config.findUnique({
      where: { brand_code_vertical_id: { brand_code: brand.brandCode, vertical_id: vertical.id } },
    });

    const disabledModules = new Set<string>((cfg?.disabled_modules as string[]) ?? []);
    const hiddenMenus = new Set<string>((cfg?.hidden_menus as string[]) ?? []);
    const disabledFeatures = new Set<string>((cfg?.disabled_features as string[]) ?? []);

    return {
      vertical: {
        ...vertical,
        display_name: cfg?.custom_name ?? vertical.display_name,
        description: cfg?.custom_description ?? vertical.description,
        color_theme: cfg?.custom_color ?? vertical.color_theme,
        base_price: cfg?.custom_price ?? vertical.base_price,
        per_user_price: cfg?.custom_per_user_price ?? vertical.per_user_price,
      },
      modules: vertical.pc_vertical_module.filter((m) => !disabledModules.has(m.module_code)),
      menus: vertical.pc_vertical_menu.filter((m) => !hiddenMenus.has(m.menu_code)),
      features: vertical.pc_vertical_feature.filter((f) => !disabledFeatures.has(f.feature_code)),
      brand_config: cfg,
      all_modules: vertical.pc_vertical_module,
      all_menus: vertical.pc_vertical_menu,
      all_features: vertical.pc_vertical_feature,
    };
  }
}
