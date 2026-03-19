// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class IndustryConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { businessType: true },
    });
    if (!tenant?.businessType) return null;
    const bt = tenant.businessType;
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
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { businessType: true },
    });
    if (!tenant?.businessType) return [];
    const extraFields = (tenant.businessType.extraFields ?? {}) as Record<string, any[]>;
    return extraFields[entity] || [];
  }

  async getLeadStages(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { businessType: true },
    });
    return (tenant?.businessType?.defaultLeadStages as string[]) ?? null;
  }

  async getActivityTypes(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { businessType: true },
    });
    return (tenant?.businessType?.defaultActivityTypes as string[]) ?? null;
  }
}
