import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { industryFilter } from '../../../common/utils/industry-filter.util';

// ── Feature shape stored in the JSONB `features` column ──────────────
export interface ModuleFeature {
  code: string;
  name: string;
  type: 'PAGE' | 'WIDGET' | 'REPORT' | 'ACTION';
  menuKey?: string;
  isDefault?: boolean;
}

// ── Query helpers ────────────────────────────────────────────────────
export interface ModuleListQuery {
  category?: string;
  status?: string;
  search?: string;
  industryCode?: string;
  page?: number;
  limit?: number;
}

export interface SubscriberQuery {
  page?: number;
  limit?: number;
}

export interface DependencyNode {
  code: string;
  name: string;
  level: number;
}

@Injectable()
export class ModuleRegistryService {
  private readonly logger = new Logger(ModuleRegistryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── 1. List modules with filtering & pagination ─────────────────
  async list(query?: ModuleListQuery) {
    const page = Math.max(query?.page ?? 1, 1);
    const limit = Math.min(Math.max(query?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ModuleDefinitionWhereInput = {};

    if (query?.category) {
      where.category = query.category as any;
    }

    if (query?.status) {
      where.moduleStatus = query.status as any;
    }

    if (query?.industryCode) {
      Object.assign(where, industryFilter(query.industryCode));
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.moduleDefinition.findMany({
        where,
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.moduleDefinition.count({ where }),
    ]);

    return { data, total };
  }

  // ─── 2. Get by ID (includes packageModules count) ────────────────
  async getById(id: string) {
    const module = await this.prisma.moduleDefinition.findUnique({
      where: { id },
      include: {
        _count: { select: { packageModules: true } },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module definition ${id} not found`);
    }

    return module;
  }

  // ─── 3. Get by code ──────────────────────────────────────────────
  async getByCode(code: string) {
    const module = await this.prisma.moduleDefinition.findUnique({
      where: { code },
    });

    if (!module) {
      throw new NotFoundException(
        `Module definition with code '${code}' not found`,
      );
    }

    return module;
  }

  // ─── 4. Create ───────────────────────────────────────────────────
  async create(data: {
    code: string;
    name: string;
    description?: string;
    category: string;
    version?: string;
    moduleStatus?: string;
    isCore?: boolean;
    iconName?: string;
    sortOrder?: number;
    dependsOn?: string[];
    features?: ModuleFeature[];
    menuKeys?: string[];
    defaultPricingType?: string;
    basePrice?: number;
    priceMonthly?: number;
    priceYearly?: number;
    oneTimeSetupFee?: number;
    trialDays?: number;
    trialFeatures?: string[];
    usagePricing?: Record<string, number>;
    isFeatured?: boolean;
    isActive?: boolean;
  }) {
    return this.prisma.moduleDefinition.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        category: data.category as any,
        version: data.version ?? '1.0.0',
        moduleStatus: (data.moduleStatus as any) ?? 'ACTIVE',
        isCore: data.isCore ?? false,
        iconName: data.iconName ?? null,
        sortOrder: data.sortOrder ?? 0,
        dependsOn: data.dependsOn ?? [],
        features: (data.features as any) ?? [],
        menuKeys: data.menuKeys ?? [],
        defaultPricingType: (data.defaultPricingType as any) ?? 'INCLUDED',
        basePrice: data.basePrice ?? 0,
        priceMonthly: data.priceMonthly ?? null,
        priceYearly: data.priceYearly ?? null,
        oneTimeSetupFee: data.oneTimeSetupFee ?? null,
        trialDays: data.trialDays ?? 0,
        trialFeatures: data.trialFeatures ?? [],
        usagePricing: data.usagePricing ?? Prisma.JsonNull,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
      },
    });
  }

  // ─── 5. Update (partial) ─────────────────────────────────────────
  async update(id: string, data: Partial<Omit<Parameters<typeof this.create>[0], 'code'>>) {
    const existing = await this.prisma.moduleDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Module definition ${id} not found`);
    }

    const updateData: any = { ...data };

    // Cast enum strings for Prisma
    if (data.category) updateData.category = data.category as any;
    if (data.moduleStatus) updateData.moduleStatus = data.moduleStatus as any;
    if (data.defaultPricingType)
      updateData.defaultPricingType = data.defaultPricingType as any;

    // Handle explicit null for optional JSON
    if ('usagePricing' in data && data.usagePricing === undefined) {
      updateData.usagePricing = Prisma.JsonNull;
    }

    return this.prisma.moduleDefinition.update({
      where: { id },
      data: updateData,
    });
  }

  // ─── 6. Archive (soft-deactivate) ────────────────────────────────
  async archive(id: string) {
    const existing = await this.prisma.moduleDefinition.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Module definition ${id} not found`);
    }

    return this.prisma.moduleDefinition.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── 7. Add feature to JSONB array ───────────────────────────────
  async addFeature(
    moduleId: string,
    feature: ModuleFeature,
  ) {
    const module = await this.prisma.moduleDefinition.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module definition ${moduleId} not found`);
    }

    const features = this.parseFeatures(module.features);

    if (features.some((f) => f.code === feature.code)) {
      throw new BadRequestException(
        `Feature with code '${feature.code}' already exists in module '${module.code}'`,
      );
    }

    features.push(feature);

    return this.prisma.moduleDefinition.update({
      where: { id: moduleId },
      data: { features: features as any },
    });
  }

  // ─── 8. Update a feature in the JSONB array ──────────────────────
  async updateFeature(
    moduleId: string,
    featureCode: string,
    updates: Partial<Omit<ModuleFeature, 'code'>>,
  ) {
    const module = await this.prisma.moduleDefinition.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module definition ${moduleId} not found`);
    }

    const features = this.parseFeatures(module.features);
    const index = features.findIndex((f) => f.code === featureCode);

    if (index === -1) {
      throw new NotFoundException(
        `Feature '${featureCode}' not found in module '${module.code}'`,
      );
    }

    features[index] = { ...features[index], ...updates, code: featureCode };

    return this.prisma.moduleDefinition.update({
      where: { id: moduleId },
      data: { features: features as any },
    });
  }

  // ─── 9. Remove a feature from the JSONB array ────────────────────
  async removeFeature(moduleId: string, featureCode: string) {
    const module = await this.prisma.moduleDefinition.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module definition ${moduleId} not found`);
    }

    const features = this.parseFeatures(module.features);
    const filtered = features.filter((f) => f.code !== featureCode);

    if (filtered.length === features.length) {
      throw new NotFoundException(
        `Feature '${featureCode}' not found in module '${module.code}'`,
      );
    }

    return this.prisma.moduleDefinition.update({
      where: { id: moduleId },
      data: { features: filtered as any },
    });
  }

  // ─── 10. Set menu keys ───────────────────────────────────────────
  async setMenuKeys(moduleId: string, menuKeys: string[]) {
    const module = await this.prisma.moduleDefinition.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module definition ${moduleId} not found`);
    }

    return this.prisma.moduleDefinition.update({
      where: { id: moduleId },
      data: { menuKeys },
    });
  }

  // ─── 11. Get dependency tree (recursive) ─────────────────────────
  async getDependencyTree(moduleId: string): Promise<DependencyNode[]> {
    const root = await this.prisma.moduleDefinition.findUnique({
      where: { id: moduleId },
    });

    if (!root) {
      throw new NotFoundException(`Module definition ${moduleId} not found`);
    }

    const result: DependencyNode[] = [];
    const visited = new Set<string>();
    const queue: { code: string; level: number }[] = [];

    // Seed BFS with direct dependencies
    for (const depCode of root.dependsOn) {
      if (!visited.has(depCode)) {
        visited.add(depCode);
        queue.push({ code: depCode, level: 1 });
      }
    }

    while (queue.length > 0) {
      const { code, level } = queue.shift()!;

      const dep = await this.prisma.moduleDefinition.findUnique({
        where: { code },
        select: { code: true, name: true, dependsOn: true },
      });

      if (!dep) {
        this.logger.warn(
          `Dependency '${code}' referenced by module '${root.code}' not found`,
        );
        result.push({ code, name: code, level });
        continue;
      }

      result.push({ code: dep.code, name: dep.name, level });

      for (const childCode of dep.dependsOn) {
        if (!visited.has(childCode)) {
          visited.add(childCode);
          queue.push({ code: childCode, level: level + 1 });
        }
      }
    }

    return result;
  }

  // ─── 12. Set dependencies (with circular check) ──────────────────
  async setDependencies(moduleId: string, dependsOn: string[]) {
    const module = await this.prisma.moduleDefinition.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module definition ${moduleId} not found`);
    }

    // Validate all dependency codes exist
    if (dependsOn.length > 0) {
      const existing = await this.prisma.moduleDefinition.findMany({
        where: { code: { in: dependsOn } },
        select: { code: true },
      });

      const existingCodes = new Set(existing.map((m) => m.code));
      const missing = dependsOn.filter((c) => !existingCodes.has(c));

      if (missing.length > 0) {
        throw new BadRequestException(
          `Unknown dependency codes: ${missing.join(', ')}`,
        );
      }

      // Self-reference check
      if (dependsOn.includes(module.code)) {
        throw new BadRequestException(
          `Module '${module.code}' cannot depend on itself`,
        );
      }

      // Circular dependency check via BFS
      await this.checkCircularDependency(module.code, dependsOn);
    }

    return this.prisma.moduleDefinition.update({
      where: { id: moduleId },
      data: { dependsOn },
    });
  }

  // ─── 13. Get subscribers (tenants using this module) ─────────────
  async getSubscribers(moduleId: string, query?: SubscriberQuery) {
    const module = await this.prisma.moduleDefinition.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module definition ${moduleId} not found`);
    }

    const page = Math.max(query?.page ?? 1, 1);
    const limit = Math.min(Math.max(query?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TenantModuleWhereInput = { moduleId };

    const [data, total] = await Promise.all([
      this.prisma.tenantModule.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: { enabledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.tenantModule.count({ where }),
    ]);

    return { data, total };
  }

  // ── Private helpers ──────────────────────────────────────────────

  /**
   * Parse the JSONB features column into a typed array.
   * Prisma returns Json as `unknown`; this normalises it.
   */
  private parseFeatures(raw: unknown): ModuleFeature[] {
    if (Array.isArray(raw)) return raw as ModuleFeature[];
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * BFS-based circular dependency detection.
   * Checks whether any transitive dependency of `newDeps` eventually
   * points back to `moduleCode`.
   */
  private async checkCircularDependency(
    moduleCode: string,
    newDeps: string[],
  ): Promise<void> {
    const visited = new Set<string>();
    const queue = [...newDeps];

    while (queue.length > 0) {
      const code = queue.shift()!;

      if (code === moduleCode) {
        throw new BadRequestException(
          `Circular dependency detected: '${moduleCode}' would transitively depend on itself`,
        );
      }

      if (visited.has(code)) continue;
      visited.add(code);

      const dep = await this.prisma.moduleDefinition.findUnique({
        where: { code },
        select: { dependsOn: true },
      });

      if (dep) {
        for (const child of dep.dependsOn) {
          if (!visited.has(child)) {
            queue.push(child);
          }
        }
      }
    }
  }
}
