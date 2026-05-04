// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class IndustryConfigService {
  constructor(private readonly prisma: PrismaService) {}

  /** Fetch tenant + its business type (cross-db: Tenant=IdentityDB, BusinessTypeRegistry=PlatformDB). */
  private async getTenantWithBt(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const bt = tenant?.businessTypeId
      ? await this.prisma.platform.businessTypeRegistry.findUnique({ where: { id: tenant.businessTypeId } })
      : null;
    return { tenant, bt };
  }

  async getConfig(tenantId: string) {
    const { bt } = await this.getTenantWithBt(tenantId);
    if (!bt) return null;
    return {
      typeCode: bt.typeCode,
      typeName: bt.typeName,
      industryCategory: bt.industryCategory,
      icon: bt.icon,
      colorTheme: bt.colorTheme,
      extraFields: bt.extraFields ?? {},
      defaultLeadStages: bt.defaultLeadStages,
      defaultActivityTypes: bt.defaultActivityTypes,
      dashboardWidgets: bt.dashboardWidgets ?? [],
    };
  }

  async getExtraFields(tenantId: string, entity: string) {
    const { bt } = await this.getTenantWithBt(tenantId);
    if (!bt) return [];
    const extraFields = (bt.extraFields ?? {}) as Record<string, unknown[]>;
    return extraFields[entity] || [];
  }

  async getLeadStages(tenantId: string) {
    const { bt } = await this.getTenantWithBt(tenantId);
    return (bt?.defaultLeadStages as string[]) ?? null;
  }

  async getActivityTypes(tenantId: string) {
    const { bt } = await this.getTenantWithBt(tenantId);
    return (bt?.defaultActivityTypes as string[]) ?? null;
  }
}
