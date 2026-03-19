import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class SaleMasterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.saleMaster.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(tenantId: string, id: string) {
    const sm = await this.prisma.saleMaster.findFirst({ where: { tenantId, id } });
    if (!sm) throw new NotFoundException('Sale master not found');
    return sm;
  }

  async create(tenantId: string, data: {
    name: string; code: string; igstRate?: number; cgstRate?: number; sgstRate?: number;
    cessRate?: number; natureOfTransaction?: string; taxability?: string;
    localLedgerId?: string; centralLedgerId?: string;
    igstLedgerId?: string; cgstLedgerId?: string; sgstLedgerId?: string; cessLedgerId?: string;
    isDefault?: boolean; sortOrder?: number;
  }) {
    const existing = await this.prisma.saleMaster.findFirst({ where: { tenantId, code: data.code } });
    if (existing) throw new BadRequestException(`Sale master code "${data.code}" already exists`);
    if (data.isDefault) {
      await this.prisma.saleMaster.updateMany({ where: { tenantId, isDefault: true }, data: { isDefault: false } });
    }
    return this.prisma.saleMaster.create({ data: { tenantId, ...data } });
  }

  async update(tenantId: string, id: string, data: any) {
    const sm = await this.prisma.saleMaster.findFirst({ where: { tenantId, id } });
    if (!sm) throw new NotFoundException('Sale master not found');
    if (data.isDefault) {
      await this.prisma.saleMaster.updateMany({ where: { tenantId, isDefault: true }, data: { isDefault: false } });
    }
    return this.prisma.saleMaster.update({ where: { id }, data });
  }

  async delete(tenantId: string, id: string) {
    const sm = await this.prisma.saleMaster.findFirst({ where: { tenantId, id } });
    if (!sm) throw new NotFoundException('Sale master not found');
    return this.prisma.saleMaster.update({ where: { id }, data: { isActive: false } });
  }
}
