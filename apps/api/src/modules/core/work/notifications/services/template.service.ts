import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { industryFilter } from '../../../../../common/utils/industry-filter.util';

@Injectable()
export class NotificationTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async render(templateName: string, variables: Record<string, string>): Promise<{
    subject: string;
    body: string;
    category: string;
    channels: string[];
  }> {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { name: templateName },
    });
    if (!template || !template.isActive) {
      throw new NotFoundException(`Template "${templateName}" not found`);
    }

    const subject = this.interpolate(template.subject || '', variables);
    const body = this.interpolate(template.body, variables);

    return {
      subject,
      body,
      category: template.category,
      channels: template.channels as string[],
    };
  }

  private interpolate(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  }

  async create(data: {
    name: string;
    category: string;
    subject: string;
    body: string;
    channels?: string[];
    variables?: string[];
  }) {
    const existing = await this.prisma.notificationTemplate.findFirst({
      where: { name: data.name },
    });
    if (existing) throw new ConflictException(`Template "${data.name}" already exists`);

    return this.prisma.notificationTemplate.create({
      data: {
        name: data.name,
        category: data.category as any,
        subject: data.subject,
        body: data.body,
        channels: data.channels || ['IN_APP'],
        variables: data.variables || [],
      },
    });
  }

  async update(id: string, data: {
    subject?: string;
    body?: string;
    channels?: string[];
    variables?: string[];
    isActive?: boolean;
  }) {
    const template = await this.prisma.notificationTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.notificationTemplate.update({
      where: { id },
      data,
    });
  }

  async getAll(params?: { category?: string; isActive?: boolean; industryCode?: string }) {
    const where: any = { ...industryFilter(params?.industryCode) };
    if (params?.category) where.category = params.category;
    if (params?.isActive !== undefined) where.isActive = params.isActive;

    return this.prisma.notificationTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getByName(name: string) {
    const template = await this.prisma.notificationTemplate.findFirst({ where: { name } });
    if (!template) throw new NotFoundException(`Template "${name}" not found`);
    return template;
  }
}
