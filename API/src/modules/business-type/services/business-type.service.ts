import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BUSINESS_TYPE_SEED_DATA } from './business-type-seed-data';

@Injectable()
export class BusinessTypeService {
  private readonly logger = new Logger(BusinessTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Seed / upsert all 15 business types (idempotent). */
  async seed() {
    const results = await Promise.all(
      BUSINESS_TYPE_SEED_DATA.map((bt) =>
        this.prisma.businessTypeRegistry.upsert({
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
    return this.prisma.businessTypeRegistry.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Get a single business type by code. */
  async getByCode(typeCode: string) {
    const bt = await this.prisma.businessTypeRegistry.findUnique({
      where: { typeCode },
    });
    if (!bt) throw new NotFoundException(`Business type '${typeCode}' not found`);
    return bt;
  }

  /** Get by id. */
  async getById(id: string) {
    const bt = await this.prisma.businessTypeRegistry.findUnique({ where: { id } });
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
      include: { businessType: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const bt = tenant.businessType;
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
