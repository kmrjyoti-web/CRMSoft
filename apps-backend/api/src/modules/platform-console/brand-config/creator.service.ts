import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CreatorService {
  constructor(private readonly db: PlatformConsolePrismaService) {}

  // ─── Vertical ─────────────────────────────────────────────────────────────

  async listVerticals() {
    return this.db.pc_vertical_v2.findMany({
      orderBy: { sort_order: 'asc' },
      include: {
        _count: { select: { pc_vertical_module: true, pc_vertical_feature: true } },
      },
    });
  }

  async getVertical(vertical_code: string) {
    const v = await this.db.pc_vertical_v2.findUnique({
      where: { vertical_code },
      include: {
        _count: { select: { pc_vertical_module: true, pc_vertical_feature: true, pc_vertical_menu: true } },
      },
    });
    if (!v) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);
    return v;
  }

  async updateVerticalFlags(vertical_code: string, data: {
    is_active?: boolean;
    is_beta?: boolean;
    is_coming_soon?: boolean;
  }) {
    const v = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code } });
    if (!v) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);
    return this.db.pc_vertical_v2.update({
      where: { vertical_code },
      data: { ...data, updated_at: new Date() },
    });
  }

  async getBrandByCode(brand_code: string) {
    const brand = await this.db.brandProfile.findUnique({ where: { brandCode: brand_code } });
    if (!brand) throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
    return brand;
  }

  async validateVerticalCode(vertical_code: string) {
    const existing = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code } });
    return {
      isValid: !existing,
      message: existing ? `Code "${vertical_code}" already exists` : 'Code is available',
    };
  }

  async createVertical(data: {
    vertical_code: string;
    vertical_name: string;
    display_name: string;
    description?: string;
    icon_name?: string;
    color_theme?: string;
    folder_path: string;
    package_name: string;
    api_prefix: string;
    database_schemas?: string[];
    base_price?: number | null;
    per_user_price?: number | null;
    currency?: string;
    is_active?: boolean;
    is_beta?: boolean;
    is_coming_soon?: boolean;
    sort_order?: number;
  }) {
    const existing = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: data.vertical_code } });
    if (existing) throw new HttpException(`Vertical code "${data.vertical_code}" already exists`, HttpStatus.CONFLICT);

    return this.db.pc_vertical_v2.create({
      data: {
        id: randomUUID(),
        vertical_code: data.vertical_code,
        vertical_name: data.vertical_name,
        display_name: data.display_name,
        description: data.description ?? null,
        icon_name: data.icon_name ?? null,
        color_theme: data.color_theme ?? null,
        folder_path: data.folder_path,
        package_name: data.package_name,
        api_prefix: data.api_prefix,
        database_schemas: data.database_schemas ?? ['working_db'],
        base_price: data.base_price ?? null,
        per_user_price: data.per_user_price ?? null,
        currency: data.currency ?? 'INR',
        is_active: data.is_active ?? true,
        is_beta: data.is_beta ?? false,
        is_coming_soon: data.is_coming_soon ?? false,
        sort_order: data.sort_order ?? 99,
        updated_at: new Date(),
      },
    });
  }

  // ─── Module ───────────────────────────────────────────────────────────────

  async validateModuleCode(verticalCode: string, module_code: string) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) return { isValid: false, message: 'Vertical not found' };
    const existing = await this.db.pc_vertical_module.findFirst({
      where: { vertical_id: vertical.id, module_code },
    });
    return {
      isValid: !existing,
      message: existing ? `Module code "${module_code}" already exists in this vertical` : 'Code is available',
    };
  }

  async createModule(verticalCode: string, data: {
    module_code: string;
    module_name: string;
    display_name: string;
    description?: string;
    icon_name?: string;
    color_theme?: string;
    sort_order?: number;
    is_required?: boolean;
    is_default_enabled?: boolean;
    is_premium?: boolean;
    package_path?: string;
    api_namespace?: string;
    db_tables?: string[];
    depends_on?: string[];
    conflicts_with?: string[];
    addon_price?: number | null;
    per_user_addon?: number | null;
  }) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    const existing = await this.db.pc_vertical_module.findFirst({
      where: { vertical_id: vertical.id, module_code: data.module_code },
    });
    if (existing) throw new HttpException(`Module code "${data.module_code}" already exists in this vertical`, HttpStatus.CONFLICT);

    return this.db.pc_vertical_module.create({
      data: {
        id: randomUUID(),
        vertical_id: vertical.id,
        module_code: data.module_code,
        module_name: data.module_name,
        display_name: data.display_name,
        description: data.description ?? null,
        icon_name: data.icon_name ?? null,
        color_theme: data.color_theme ?? null,
        sort_order: data.sort_order ?? 99,
        is_required: data.is_required ?? false,
        is_default_enabled: data.is_default_enabled ?? true,
        is_premium: data.is_premium ?? false,
        package_path: data.package_path ?? null,
        api_namespace: data.api_namespace ?? null,
        db_tables: data.db_tables ?? [],
        depends_on: data.depends_on ?? [],
        conflicts_with: data.conflicts_with ?? [],
        addon_price: data.addon_price ?? null,
        per_user_addon: data.per_user_addon ?? null,
        updated_at: new Date(),
      },
    });
  }

  async updateModule(moduleId: string, data: Record<string, unknown>) {
    const allowed = [
      'module_name', 'display_name', 'description', 'icon_name', 'color_theme',
      'sort_order', 'is_required', 'is_default_enabled', 'is_premium',
      'package_path', 'api_namespace', 'db_tables', 'depends_on', 'conflicts_with',
      'addon_price', 'per_user_addon',
    ];
    const update: Record<string, unknown> = { updated_at: new Date() };
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    return this.db.pc_vertical_module.update({ where: { id: moduleId }, data: update });
  }

  async deleteModule(moduleId: string) {
    return this.db.pc_vertical_module.delete({ where: { id: moduleId } });
  }

  async getModulesForVertical(verticalCode: string) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);
    return this.db.pc_vertical_module.findMany({
      where: { vertical_id: vertical.id },
      orderBy: { sort_order: 'asc' },
    });
  }

  // ─── Feature ──────────────────────────────────────────────────────────────

  async validateFeatureCode(verticalCode: string, feature_code: string) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) return { isValid: false, message: 'Vertical not found' };
    const existing = await this.db.pc_vertical_feature.findFirst({
      where: { vertical_id: vertical.id, feature_code },
    });
    return {
      isValid: !existing,
      message: existing ? `Feature code "${feature_code}" already exists in this vertical` : 'Code is available',
    };
  }

  async createFeature(verticalCode: string, data: {
    feature_code: string;
    feature_name: string;
    description?: string;
    category?: string;
    sub_category?: string;
    module_code?: string;
    is_default_enabled?: boolean;
    is_premium?: boolean;
    is_beta?: boolean;
    is_experimental?: boolean;
    addon_price?: number | null;
    sort_order?: number;
  }) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    const existing = await this.db.pc_vertical_feature.findFirst({
      where: { vertical_id: vertical.id, feature_code: data.feature_code },
    });
    if (existing) throw new HttpException(`Feature code "${data.feature_code}" already exists in this vertical`, HttpStatus.CONFLICT);

    let moduleId: string | null = null;
    if (data.module_code) {
      const mod = await this.db.pc_vertical_module.findFirst({
        where: { vertical_id: vertical.id, module_code: data.module_code },
      });
      moduleId = mod?.id ?? null;
    }

    return this.db.pc_vertical_feature.create({
      data: {
        id: randomUUID(),
        vertical_id: vertical.id,
        module_id: moduleId,
        feature_code: data.feature_code,
        feature_name: data.feature_name,
        description: data.description ?? null,
        category: data.category ?? 'core',
        sub_category: data.sub_category ?? null,
        is_default_enabled: data.is_default_enabled ?? true,
        is_premium: data.is_premium ?? false,
        is_beta: data.is_beta ?? false,
        is_experimental: data.is_experimental ?? false,
        addon_price: data.addon_price ?? null,
        sort_order: data.sort_order ?? 99,
        updated_at: new Date(),
      },
    });
  }

  async updateFeature(featureId: string, data: Record<string, unknown>) {
    const allowed = [
      'feature_name', 'description', 'category', 'sub_category',
      'module_id', 'is_default_enabled', 'is_premium', 'is_beta', 'is_experimental',
      'addon_price', 'sort_order', 'icon_name', 'documentation_url',
    ];
    const update: Record<string, unknown> = { updated_at: new Date() };
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    return this.db.pc_vertical_feature.update({ where: { id: featureId }, data: update });
  }

  async deleteFeature(featureId: string) {
    return this.db.pc_vertical_feature.delete({ where: { id: featureId } });
  }
}
