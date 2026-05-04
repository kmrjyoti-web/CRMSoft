import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class AMCPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters?: { industryCode?: string; planTier?: string }) {
    return this.prisma.working.aMCPlanTemplate.findMany({
      where: {
        OR: [{ tenantId }, { isSystemTemplate: true }],
        ...(filters?.industryCode && { industryCode: filters.industryCode }),
        ...(filters?.planTier && { planTier: filters.planTier }),
        isActive: true,
      },
      include: { _count: { select: { contracts: true } } },
      orderBy: [{ isSystemTemplate: 'asc' }, { charges: 'asc' }],
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.working.aMCPlanTemplate.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('AMC plan not found');
    return plan;
  }

  async create(tenantId: string, dto: any) {
    const existing = await this.prisma.working.aMCPlanTemplate.findFirst({ where: { tenantId, code: dto.code } });
    if (existing) throw new ConflictException(`AMC plan with code ${dto.code} already exists`);
    return this.prisma.working.aMCPlanTemplate.create({
      data: { ...dto, tenantId, isSystemTemplate: false },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    const plan = await this.prisma.working.aMCPlanTemplate.findFirst({ where: { id, tenantId, isSystemTemplate: false } });
    if (!plan) throw new NotFoundException('Plan not found or cannot edit system plan');
    return this.prisma.working.aMCPlanTemplate.update({ where: { id }, data: dto });
  }

  async importSystemPlan(tenantId: string, systemPlanId: string) {
    const systemPlan = await this.prisma.working.aMCPlanTemplate.findFirst({
      where: { id: systemPlanId, isSystemTemplate: true },
    });
    if (!systemPlan) throw new NotFoundException('System plan not found');
    const { id, tenantId: _, isSystemTemplate, createdAt, updatedAt, ...data } = systemPlan as any;
    const newCode = `${data.code}-${tenantId.slice(0, 4).toUpperCase()}`;
    const existing = await this.prisma.working.aMCPlanTemplate.findFirst({ where: { tenantId, code: newCode } });
    if (existing) throw new ConflictException('Plan already imported');
    return this.prisma.working.aMCPlanTemplate.create({
      data: { ...data, tenantId, code: newCode, isSystemTemplate: false },
    });
  }
}
