import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class TemplateCustomizationService {
  private readonly logger = new Logger(TemplateCustomizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get tenant customization for a specific template, or null if none exists.
   */
  async getCustomization(tenantId: string, templateId: string) {
    return this.prisma.tenantTemplateCustomization.findUnique({
      where: {
        tenantId_templateId: { tenantId, templateId },
      },
    });
  }

  /**
   * Upsert tenant-specific customization for a system template.
   */
  async saveCustomization(
    tenantId: string,
    templateId: string,
    data: {
      customSettings?: any;
      customHeader?: string;
      customFooter?: string;
      termsAndConditions?: string;
      bankDetails?: string;
      signatureUrl?: string;
      logoUrl?: string;
      isDefault?: boolean;
    },
  ) {
    this.logger.log(
      `Saving customization for tenant ${tenantId}, template ${templateId}`,
    );

    return this.prisma.tenantTemplateCustomization.upsert({
      where: {
        tenantId_templateId: { tenantId, templateId },
      },
      create: {
        tenantId,
        templateId,
        customSettings: data.customSettings ?? {},
        customHeader: data.customHeader,
        customFooter: data.customFooter,
        termsAndConditions: data.termsAndConditions,
        bankDetails: data.bankDetails,
        signatureUrl: data.signatureUrl,
        logoUrl: data.logoUrl,
        isDefault: data.isDefault ?? false,
      },
      update: {
        customSettings: data.customSettings,
        customHeader: data.customHeader,
        customFooter: data.customFooter,
        termsAndConditions: data.termsAndConditions,
        bankDetails: data.bankDetails,
        signatureUrl: data.signatureUrl,
        logoUrl: data.logoUrl,
        isDefault: data.isDefault,
      },
    });
  }

  /**
   * Delete tenant customization, resetting to system defaults.
   */
  async resetCustomization(tenantId: string, templateId: string) {
    this.logger.log(
      `Resetting customization for tenant ${tenantId}, template ${templateId}`,
    );

    const existing = await this.prisma.tenantTemplateCustomization.findUnique({
      where: {
        tenantId_templateId: { tenantId, templateId },
      },
    });

    if (!existing) {
      return null;
    }

    return this.prisma.tenantTemplateCustomization.delete({
      where: {
        tenantId_templateId: { tenantId, templateId },
      },
    });
  }

  /**
   * Find the tenant's default template for a given document type.
   * Falls back to the system default if no tenant-specific default is set.
   */
  async getDefaultTemplate(tenantId: string, documentType: DocumentType) {
    // 1. Check for tenant-specific default customization
    const tenantDefault = await this.prisma.tenantTemplateCustomization.findFirst({
      where: {
        tenantId,
        isDefault: true,
        template: { documentType, isActive: true },
      },
      include: { template: true },
    });

    if (tenantDefault) {
      return tenantDefault.template;
    }

    // 2. Fall back to system default template for this type
    const systemDefault = await this.prisma.documentTemplate.findFirst({
      where: {
        documentType,
        isSystem: true,
        isDefault: true,
        isActive: true,
      },
    });

    if (systemDefault) {
      return systemDefault;
    }

    // 3. Fall back to any active system template of this type
    return this.prisma.documentTemplate.findFirst({
      where: {
        documentType,
        isSystem: true,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
