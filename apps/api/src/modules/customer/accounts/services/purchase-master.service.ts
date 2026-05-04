import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class PurchaseMasterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.working.purchaseMaster.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(tenantId: string, id: string) {
    const pm = await this.prisma.working.purchaseMaster.findFirst({ where: { tenantId, id } });
    if (!pm) throw new NotFoundException('Purchase master not found');
    return pm;
  }

  async create(tenantId: string, data: {
    name: string; code: string; igstRate?: number; cgstRate?: number; sgstRate?: number;
    cessRate?: number; natureOfTransaction?: string; taxability?: string;
    localLedgerId?: string; centralLedgerId?: string;
    igstLedgerId?: string; cgstLedgerId?: string; sgstLedgerId?: string; cessLedgerId?: string;
    isDefault?: boolean; sortOrder?: number;
  }) {
    const existing = await this.prisma.working.purchaseMaster.findFirst({ where: { tenantId, code: data.code } });
    if (existing) throw new BadRequestException(`Purchase master code "${data.code}" already exists`);
    if (data.isDefault) {
      await this.prisma.working.purchaseMaster.updateMany({ where: { tenantId, isDefault: true }, data: { isDefault: false } });
    }
    return this.prisma.working.purchaseMaster.create({ data: { tenantId, ...data } });
  }

  async update(tenantId: string, id: string, data: any) {
    const pm = await this.prisma.working.purchaseMaster.findFirst({ where: { tenantId, id } });
    if (!pm) throw new NotFoundException('Purchase master not found');
    if (data.isDefault) {
      await this.prisma.working.purchaseMaster.updateMany({ where: { tenantId, isDefault: true }, data: { isDefault: false } });
    }
    return this.prisma.working.purchaseMaster.update({ where: { id }, data });
  }

  async delete(tenantId: string, id: string) {
    const pm = await this.prisma.working.purchaseMaster.findFirst({ where: { tenantId, id } });
    if (!pm) throw new NotFoundException('Purchase master not found');
    return this.prisma.working.purchaseMaster.update({ where: { id }, data: { isActive: false } });
  }
}
