import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class WarrantyTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters?: { industryCode?: string; systemOnly?: boolean }) {
    return this.prisma.working.warrantyTemplate.findMany({
      where: {
        OR: [
          { tenantId },
          { isSystemTemplate: true },
        ],
        ...(filters?.industryCode && { industryCode: filters.industryCode }),
        ...(filters?.systemOnly && { isSystemTemplate: true }),
        isActive: true,
      },
      orderBy: [{ isSystemTemplate: 'asc' }, { industryCode: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(tenantId: string, id: string) {
    const template = await this.prisma.working.warrantyTemplate.findFirst({
      where: { id, OR: [{ tenantId }, { isSystemTemplate: true }] },
      include: { _count: { select: { records: true } } },
    });
    if (!template) throw new NotFoundException('Warranty template not found');
    return template;
  }

  async findByIndustry(industryCode: string) {
    return this.prisma.working.warrantyTemplate.findMany({
      where: { industryCode, isSystemTemplate: true, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, dto: any) {
    const existing = await this.prisma.working.warrantyTemplate.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (existing) throw new ConflictException(`Template with code ${dto.code} already exists`);
    return this.prisma.working.warrantyTemplate.create({
      data: { ...dto, tenantId, isSystemTemplate: false },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    const template = await this.prisma.working.warrantyTemplate.findFirst({
      where: { id, tenantId, isSystemTemplate: false },
    });
    if (!template) throw new NotFoundException('Template not found or cannot edit system template');
    return this.prisma.working.warrantyTemplate.update({ where: { id }, data: dto });
  }

  async importSystemTemplate(tenantId: string, systemTemplateId: string) {
    const systemTemplate = await this.prisma.working.warrantyTemplate.findFirst({
      where: { id: systemTemplateId, isSystemTemplate: true },
    });
    if (!systemTemplate) throw new NotFoundException('System template not found');

    const { id, tenantId: _, isSystemTemplate, createdAt, updatedAt, ...data } = systemTemplate as any;
    const newCode = `${data.code}-${tenantId.slice(0, 4).toUpperCase()}`;

    const existing = await this.prisma.working.warrantyTemplate.findFirst({
      where: { tenantId, code: newCode },
    });
    if (existing) throw new ConflictException('Template already imported');

    return this.prisma.working.warrantyTemplate.create({
      data: { ...data, tenantId, code: newCode, isSystemTemplate: false },
    });
  }
}
