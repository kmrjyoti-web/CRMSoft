import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class ServiceRateService {
  constructor(private readonly prisma: PrismaService) {}

  async getRate(serviceKey: string) {
    const rate = await this.prisma.serviceRate.findUnique({ where: { serviceKey } });
    if (!rate) return null;
    return rate;
  }

  async estimateCost(serviceKey: string): Promise<{
    serviceKey: string;
    displayName: string;
    category: string;
    baseTokens: number;
    marginPct: number;
    finalTokens: number;
  } | null> {
    const rate = await this.getRate(serviceKey);
    if (!rate) return null;

    return {
      serviceKey: rate.serviceKey,
      displayName: rate.displayName,
      category: rate.category,
      baseTokens: rate.baseTokens,
      marginPct: rate.marginPct,
      finalTokens: rate.finalTokens,
    };
  }

  // ─── Admin CRUD ───

  async findAll(params?: { category?: string; isActive?: boolean }) {
    const where: any = {};
    if (params?.category) where.category = params.category;
    if (params?.isActive !== undefined) where.isActive = params.isActive;
    return this.prisma.serviceRate.findMany({
      where,
      orderBy: [{ category: 'asc' }, { serviceKey: 'asc' }],
    });
  }

  async findById(id: string) {
    const rate = await this.prisma.serviceRate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException('Service rate not found');
    return rate;
  }

  async create(data: {
    serviceKey: string;
    displayName: string;
    category: string;
    baseTokens: number;
    marginPct?: number;
    description?: string;
  }) {
    const marginPct = data.marginPct ?? 20;
    const finalTokens = Math.ceil(data.baseTokens * (1 + marginPct / 100));

    return this.prisma.serviceRate.create({
      data: {
        serviceKey: data.serviceKey,
        displayName: data.displayName,
        category: data.category,
        baseTokens: data.baseTokens,
        marginPct,
        finalTokens,
        description: data.description,
      },
    });
  }

  async update(id: string, data: Partial<{
    displayName: string;
    category: string;
    baseTokens: number;
    marginPct: number;
    description: string;
    isActive: boolean;
  }>) {
    const existing = await this.findById(id);

    const baseTokens = data.baseTokens ?? existing.baseTokens;
    const marginPct = data.marginPct ?? existing.marginPct;
    const finalTokens = Math.ceil(baseTokens * (1 + marginPct / 100));

    return this.prisma.serviceRate.update({
      where: { id },
      data: { ...data, finalTokens },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.serviceRate.delete({ where: { id } });
  }
}
