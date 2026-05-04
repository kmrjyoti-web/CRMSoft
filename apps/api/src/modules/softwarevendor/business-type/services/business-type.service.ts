// @ts-nocheck
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/working-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { BUSINESS_TYPE_SEED_DATA } from './business-type-seed-data';

@Injectable()
export class BusinessTypeService {
  private readonly logger = new Logger(BusinessTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Seed / upsert all 15 business types (idempotent). */
  async seed() {
    const results = await Promise.all(
      BUSINESS_TYPE_SEED_DATA.map((bt) =>
        this.prisma.platform.businessTypeRegistry.upsert({
          where: { typeCode: bt.typeCode },
          update: {
            typeName: bt.typeName,
            industryCategory: bt.industryCategory as any,
            description: bt.description,
            icon: bt.icon,
            colorTheme: bt.colorTheme,
            terminologyMap: bt.terminologyMap,
            defaultModules: bt.defaultModules,
            recommendedModules: bt.recommendedModules,
            excludedModules: bt.excludedModules,
            dashboardWidgets: bt.dashboardWidgets,
            workflowTemplates: bt.workflowTemplates,
            extraFields: bt.extraFields ?? {},
            defaultLeadStages: bt.defaultLeadStages ?? Prisma.DbNull,
            defaultActivityTypes: bt.defaultActivityTypes ?? Prisma.DbNull,
            registrationFields: bt.registrationFields ?? Prisma.DbNull,
            isDefault: bt.isDefault ?? false,
          },
          create: {
            typeCode: bt.typeCode,
            typeName: bt.typeName,
            industryCategory: bt.industryCategory as any,
            description: bt.description,
            icon: bt.icon,
            colorTheme: bt.colorTheme,
            terminologyMap: bt.terminologyMap,
            defaultModules: bt.defaultModules,
            recommendedModules: bt.recommendedModules,
            excludedModules: bt.excludedModules,
            dashboardWidgets: bt.dashboardWidgets,
            workflowTemplates: bt.workflowTemplates,
            extraFields: bt.extraFields ?? {},
            defaultLeadStages: bt.defaultLeadStages ?? Prisma.DbNull,
            defaultActivityTypes: bt.defaultActivityTypes ?? Prisma.DbNull,
            registrationFields: bt.registrationFields ?? Prisma.DbNull,
            isDefault: bt.isDefault ?? false,
            sortOrder: BUSINESS_TYPE_SEED_DATA.indexOf(bt),
          },
        }),
      ),
    );
    this.logger.log(`Business types seeded: ${results.length}`);
    return results;
  }

  /** List all active business types. */
  async listAll(activeOnly = true) {
    return this.prisma.platform.businessTypeRegistry.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Get a single business type by code (includes packages). */
  async getByCode(typeCode: string) {
    const bt = await this.prisma.platform.businessTypeRegistry.findUnique({
      where: { typeCode },
      include: {
        industryPackages: { include: { package: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!bt) throw new NotFoundException(`Business type '${typeCode}' not found`);
    return bt;
  }

  /** Get by id. */
  async getById(id: string) {
    const bt = await this.prisma.platform.businessTypeRegistry.findUnique({ where: { id } });
    if (!bt) throw new NotFoundException(`Business type ${id} not found`);
    return bt;
  }

  /**
   * Resolve full profile for a tenant.
   * Merges: BusinessType defaults → tenant-level overrides → terminology.
   */
  async resolveProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Fetch business type separately (cross-db: Tenant in IdentityDB, BusinessTypeRegistry in PlatformDB)
    const bt = tenant.businessTypeId
      ? await this.prisma.platform.businessTypeRegistry.findUnique({ where: { id: tenant.businessTypeId } })
      : null;
    const terminologyMap: Record<string, string> = bt
      ? (bt.terminologyMap as Record<string, string>) ?? {}
      : {};

    // Merge tenant-level terminology overrides
    const overrides = await this.prisma.terminologyOverride.findMany({
      where: { tenantId, isActive: true },
    });
    for (const ov of overrides) {
      terminologyMap[ov.termKey] = ov.customLabel;
    }

    return {
      tenantId,
      businessType: bt
        ? {
            typeCode: bt.typeCode,
            typeName: bt.typeName,
            industryCategory: bt.industryCategory,
            icon: bt.icon,
            colorTheme: bt.colorTheme,
          }
        : null,
      terminology: terminologyMap,
      defaultModules: bt ? (bt.defaultModules as string[]) : [],
      recommendedModules: bt ? (bt.recommendedModules as string[]) : [],
      excludedModules: bt ? (bt.excludedModules as string[]) : [],
      dashboardWidgets: bt ? (bt.dashboardWidgets as string[]) : [],
      workflowTemplates: bt ? (bt.workflowTemplates as string[]) : [],
      tradeProfile: tenant.tradeProfileJson ?? {},
    };
  }

  /** Update a business type by code (vendor portal). */
  async update(typeCode: string, data: Record<string, any>) {
    const bt = await this.getByCode(typeCode);
    const { typeName, description, icon, colorTheme, terminologyMap, extraFields,
      defaultModules, recommendedModules, excludedModules, defaultLeadStages,
      defaultActivityTypes, registrationFields, dashboardWidgets, isActive, sortOrder,
    } = data;
    return this.prisma.platform.businessTypeRegistry.update({
      where: { id: bt.id },
      data: {
        ...(typeName !== undefined && { typeName }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(colorTheme !== undefined && { colorTheme }),
        ...(terminologyMap !== undefined && { terminologyMap }),
        ...(extraFields !== undefined && { extraFields }),
        ...(defaultModules !== undefined && { defaultModules }),
        ...(recommendedModules !== undefined && { recommendedModules }),
        ...(excludedModules !== undefined && { excludedModules }),
        ...(defaultLeadStages !== undefined && { defaultLeadStages }),
        ...(defaultActivityTypes !== undefined && { defaultActivityTypes }),
        ...(registrationFields !== undefined && { registrationFields }),
        ...(dashboardWidgets !== undefined && { dashboardWidgets }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
  }

  /** List tenants using a specific business type. */
  async getTenants(typeCode: string) {
    const bt = await this.getByCode(typeCode);
    return this.prisma.tenant.findMany({
      where: { businessTypeId: bt.id },
      select: { id: true, name: true, slug: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Assign a business type to a tenant. */
  async assignToTenant(tenantId: string, typeCode: string) {
    const bt = await this.getByCode(typeCode);
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { businessTypeId: bt.id },
    });
  }

  /** Update tenant trade profile JSON. */
  async updateTradeProfile(tenantId: string, profile: Record<string, any>) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { tradeProfileJson: profile },
    });
  }
}
