import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WaApiService } from './wa-api.service';

@Injectable()
export class WaTemplateService {
  private readonly logger = new Logger(WaTemplateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waApiService: WaApiService,
  ) {}

  async syncFromMeta(wabaId: string): Promise<{ synced: number; added: number; updated: number }> {
    const metaTemplates = await this.waApiService.getTemplates(wabaId);
    let added = 0;
    let updated = 0;

    for (const mt of metaTemplates) {
      const existing = await this.prisma.working.waTemplate.findFirst({
        where: { metaTemplateId: mt.id },
      });

      const headerComponent = mt.components?.find((c: any) => c.type === 'HEADER');
      const bodyComponent = mt.components?.find((c: any) => c.type === 'BODY');
      const footerComponent = mt.components?.find((c: any) => c.type === 'FOOTER');
      const buttonsComponent = mt.components?.find((c: any) => c.type === 'BUTTONS');

      const data = {
        name: mt.name,
        language: mt.language,
        category: this.mapCategory(mt.category),
        status: this.mapStatus(mt.status),
        headerType: headerComponent?.format || null,
        headerContent: headerComponent?.text || null,
        bodyText: bodyComponent?.text || '',
        footerText: footerComponent?.text || null,
        buttons: buttonsComponent?.buttons || null,
        lastSyncedAt: new Date(),
        rejectionReason: mt.rejected_reason || null,
      };

      if (existing) {
        await this.prisma.working.waTemplate.update({
          where: { id: existing.id },
          data,
        });
        updated++;
      } else {
        await this.prisma.working.waTemplate.create({
          data: {
            ...data,
            wabaId,
            metaTemplateId: mt.id,
          },
        });
        added++;
      }
    }

    return { synced: metaTemplates.length, added, updated };
  }

  async createOnMeta(wabaId: string, templateData: {
    name: string;
    language: string;
    category: string;
    headerType?: string;
    headerContent?: string;
    bodyText: string;
    footerText?: string;
    buttons?: any;
    variables?: any;
    sampleValues?: any;
  }) {
    const components: any[] = [];

    if (templateData.headerType) {
      components.push({
        type: 'HEADER',
        format: templateData.headerType,
        text: templateData.headerContent,
      });
    }

    components.push({
      type: 'BODY',
      text: templateData.bodyText,
    });

    if (templateData.footerText) {
      components.push({ type: 'FOOTER', text: templateData.footerText });
    }

    if (templateData.buttons) {
      components.push({ type: 'BUTTONS', buttons: templateData.buttons });
    }

    const metaResult = await this.waApiService.createTemplate(wabaId, {
      name: templateData.name,
      language: templateData.language,
      category: templateData.category,
      components,
    });

    return this.prisma.working.waTemplate.create({
      data: {
        wabaId,
        metaTemplateId: metaResult.id,
        name: templateData.name,
        language: templateData.language,
        category: this.mapCategory(templateData.category),
        status: 'PENDING',
        headerType: templateData.headerType,
        headerContent: templateData.headerContent,
        bodyText: templateData.bodyText,
        footerText: templateData.footerText,
        buttons: templateData.buttons,
        variables: templateData.variables,
        sampleValues: templateData.sampleValues,
      },
    });
  }

  async deleteOnMeta(templateId: string): Promise<void> {
    const template = await this.prisma.working.waTemplate.findUniqueOrThrow({ where: { id: templateId } });
    await this.waApiService.deleteTemplate(template.wabaId, template.name);
    await this.prisma.working.waTemplate.update({
      where: { id: templateId },
      data: { status: 'DELETED' },
    });
  }

  private mapCategory(category: string): any {
    const map: Record<string, string> = {
      UTILITY: 'UTILITY',
      AUTHENTICATION: 'AUTHENTICATION',
      MARKETING: 'MARKETING',
    };
    return map[category] || 'UTILITY';
  }

  private mapStatus(status: string): any {
    const map: Record<string, string> = {
      APPROVED: 'APPROVED',
      PENDING: 'PENDING',
      REJECTED: 'REJECTED',
      PAUSED: 'PAUSED',
      DISABLED: 'DISABLED',
    };
    return map[status] || 'PENDING';
  }
}
