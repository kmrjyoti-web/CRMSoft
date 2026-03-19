import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class ServiceVisitService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.serviceVisitLog.count({ where: { tenantId } });
    return `SV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(tenantId: string, filters?: { customerId?: string; sourceType?: string; status?: string }) {
    return this.prisma.serviceVisitLog.findMany({
      where: {
        tenantId,
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.sourceType && { sourceType: filters.sourceType }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { charges: true },
      orderBy: { visitDate: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const visit = await this.prisma.serviceVisitLog.findFirst({
      where: { id, tenantId },
      include: { charges: true },
    });
    if (!visit) throw new NotFoundException('Service visit not found');
    return visit;
  }

  async create(tenantId: string, dto: any) {
    const visitNumber = await this.generateNumber(tenantId);
    return this.prisma.serviceVisitLog.create({
      data: { ...dto, tenantId, visitNumber },
      include: { charges: true },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    const visit = await this.prisma.serviceVisitLog.findFirst({ where: { id, tenantId } });
    if (!visit) throw new NotFoundException('Visit not found');
    return this.prisma.serviceVisitLog.update({
      where: { id },
      data: dto,
      include: { charges: true },
    });
  }
}
