import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { MODULE_SEED_DATA } from './module-seed-data';

@Injectable()
export class ModuleDefinitionService {
  private readonly logger = new Logger(ModuleDefinitionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seed/upsert all module definitions from MODULE_SEED_DATA.
   * Safe to run multiple times (idempotent via upsert on code).
   */
  async seed() {
    const results = await Promise.all(
      MODULE_SEED_DATA.map((mod) =>
        this.prisma.platform.moduleDefinition.upsert({
          where: { code: mod.code },
          update: {
            name: mod.name,
            category: mod.category as any,
            isCore: mod.isCore,
            iconName: mod.iconName,
            sortOrder: mod.sortOrder,
            dependsOn: mod.dependsOn,
            isActive: true,
          },
          create: {
            code: mod.code,
            name: mod.name,
            category: mod.category as any,
            isCore: mod.isCore,
            iconName: mod.iconName,
            sortOrder: mod.sortOrder,
            dependsOn: mod.dependsOn,
            isActive: true,
          },
        }),
      ),
    );

    this.logger.log(`Module definitions seeded: ${results.length} modules`);
    return results;
  }

  /**
   * List all module definitions, optionally filtered by category.
   * Ordered by category, then sortOrder.
   */
  async listAll(query?: { category?: string }) {
    const where: any = {};

    if (query?.category) {
      where.category = query.category;
    }

    return this.prisma.platform.moduleDefinition.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  /**
   * Get a single module definition by its unique code.
   */
  async getByCode(code: string) {
    const module = await this.prisma.platform.moduleDefinition.findUnique({
      where: { code },
    });

    if (!module) {
      throw new NotFoundException(`Module definition with code '${code}' not found`);
    }

    return module;
  }

  /**
   * Create a new module definition.
   */
  async create(data: {
    code: string;
    name: string;
    description?: string;
    category: string;
    isCore?: boolean;
    iconName?: string;
    sortOrder?: number;
    dependsOn?: string[];
    isActive?: boolean;
  }) {
    return this.prisma.platform.moduleDefinition.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        category: data.category as any,
        isCore: data.isCore ?? false,
        iconName: data.iconName ?? null,
        sortOrder: data.sortOrder ?? 0,
        dependsOn: data.dependsOn ?? [],
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Update an existing module definition.
   */
  async update(id: string, data: any) {
    const module = await this.prisma.platform.moduleDefinition.findUnique({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module definition ${id} not found`);
    }

    return this.prisma.platform.moduleDefinition.update({
      where: { id },
      data,
    });
  }
}
