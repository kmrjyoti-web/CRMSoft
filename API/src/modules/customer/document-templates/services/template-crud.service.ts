import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DocumentType, Prisma } from '@prisma/client';

@Injectable()
export class TemplateCrudService {
  private readonly logger = new Logger(TemplateCrudService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List templates with optional filters.
   */
  async findAll(filters: {
    documentType?: DocumentType;
    industryCode?: string;
    isActive?: boolean;
    isSystem?: boolean;
    tenantId?: string;
  }) {
    const where: Prisma.DocumentTemplateWhereInput = {};

    if (filters.documentType) where.documentType = filters.documentType;
    if (filters.industryCode) where.industryCode = filters.industryCode;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.isSystem !== undefined) where.isSystem = filters.isSystem;
    if (filters.tenantId) where.tenantId = filters.tenantId;

    return this.prisma.documentTemplate.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get a single template by ID, including tenant customizations.
   */
  async findById(id: string) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id },
      include: { tenantCustomizations: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    return template;
  }

  /**
   * Find templates available for a tenant:
   *   - system templates (no tenant-specific ownership)
   *   - matching industry code
   *   - tenant's own custom templates
   */
  async findByType(type: string, tenantId?: string, industryCode?: string) {
    const documentType = type as DocumentType;

    const orConditions: Prisma.DocumentTemplateWhereInput[] = [
      { isSystem: true, tenantId: null },
    ];

    if (industryCode) {
      orConditions.push({ industryCode, tenantId: null });
    }

    if (tenantId) {
      orConditions.push({ tenantId });
    }

    return this.prisma.documentTemplate.findMany({
      where: {
        documentType,
        isActive: true,
        OR: orConditions,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Create a new document template.
   */
  async create(data: Prisma.DocumentTemplateCreateInput) {
    this.logger.log(`Creating template: ${data.name} (${data.documentType})`);

    return this.prisma.documentTemplate.create({ data });
  }

  /**
   * Update an existing document template.
   */
  async update(id: string, data: Prisma.DocumentTemplateUpdateInput) {
    await this.findById(id); // ensure exists

    this.logger.log(`Updating template: ${id}`);

    return this.prisma.documentTemplate.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft archive a template by setting isActive to false.
   */
  async archive(id: string) {
    await this.findById(id);

    this.logger.log(`Archiving template: ${id}`);

    return this.prisma.documentTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Duplicate a template with a "-copy" suffix on code and name.
   */
  async duplicate(id: string) {
    const original = await this.findById(id);

    this.logger.log(`Duplicating template: ${original.name}`);

    return this.prisma.documentTemplate.create({
      data: {
        code: `${original.code}-copy`,
        name: `${original.name} - Copy`,
        description: original.description,
        documentType: original.documentType,
        htmlTemplate: original.htmlTemplate,
        cssStyles: original.cssStyles,
        defaultSettings: original.defaultSettings ?? {},
        availableFields: original.availableFields ?? [],
        industryCode: original.industryCode,
        thumbnailUrl: original.thumbnailUrl,
        sortOrder: original.sortOrder,
        isDefault: false,
        isSystem: false,
        isActive: true,
        tenantId: original.tenantId,
      },
    });
  }

  /**
   * Set a template as the default for a given tenant + document type.
   * Unsets the previous default first.
   */
  async setDefault(templateId: string, tenantId: string, documentType: DocumentType) {
    this.logger.log(
      `Setting default template: ${templateId} for tenant ${tenantId}, type ${documentType}`,
    );

    await this.prisma.$transaction(async (tx) => {
      // Unset existing default customization for this tenant + type
      const existingDefaults = await tx.tenantTemplateCustomization.findMany({
        where: {
          tenantId,
          isDefault: true,
          template: { documentType },
        },
      });

      for (const existing of existingDefaults) {
        await tx.tenantTemplateCustomization.update({
          where: { id: existing.id },
          data: { isDefault: false },
        });
      }

      // Upsert the new default customization
      await tx.tenantTemplateCustomization.upsert({
        where: {
          tenantId_templateId: { tenantId, templateId },
        },
        create: {
          tenantId,
          templateId,
          isDefault: true,
        },
        update: {
          isDefault: true,
        },
      });
    });

    return this.findById(templateId);
  }
}
