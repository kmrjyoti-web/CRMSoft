import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class RFQService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, filters?: {
    status?: string; page?: number; limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.working.purchaseRFQ.findMany({
        where,
        include: {
          items: true,
          _count: { select: { quotations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.purchaseRFQ.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(tenantId: string, id: string) {
    const rfq = await this.prisma.working.purchaseRFQ.findFirst({
      where: { id, tenantId },
      include: {
        items: true,
        quotations: { include: { items: true } },
      },
    });
    if (!rfq) throw new NotFoundException('RFQ not found');
    return rfq;
  }

  async create(tenantId: string, userId: string, dto: {
    rfqNumber: string; dueDate?: string; notes?: string;
    items: Array<{ productId: string; quantity: number; unitId?: string; specifications?: string }>;
    vendorIds?: string[];
  }) {
    return this.prisma.working.purchaseRFQ.create({
      data: {
        tenantId,
        rfqNumber: dto.rfqNumber,
        title: `RFQ ${dto.rfqNumber}`,
        requiredByDate: dto.dueDate ? new Date(dto.dueDate) : null,
        remarks: dto.notes,
        status: 'DRAFT',
        createdById: userId,
        sentToVendorIds: dto.vendorIds ?? [],
        items: {
          create: dto.items.map((item) => ({
            tenantId,
            productId: item.productId,
            quantity: item.quantity,
            unitId: item.unitId ?? '',
            specifications: item.specifications,
          })),
        },
      },
      include: { items: true },
    });
  }

  async update(tenantId: string, id: string, dto: { dueDate?: string; notes?: string; status?: string }) {
    const rfq = await this.prisma.working.purchaseRFQ.findFirst({ where: { id, tenantId } });
    if (!rfq) throw new NotFoundException('RFQ not found');

    const data: any = {};
    if (dto.dueDate !== undefined) data.requiredByDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.notes !== undefined) data.remarks = dto.notes;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.working.purchaseRFQ.update({ where: { id }, data });
  }

  async sendToVendors(tenantId: string, id: string, vendorIds: string[]) {
    const rfq = await this.prisma.working.purchaseRFQ.findFirst({ where: { id, tenantId } });
    if (!rfq) throw new NotFoundException('RFQ not found');

    return this.prisma.working.purchaseRFQ.update({
      where: { id },
      data: {
        status: 'SENT',
        sentToVendorIds: [...new Set([...rfq.sentToVendorIds, ...vendorIds])],
      },
    });
  }

  async close(tenantId: string, id: string) {
    const rfq = await this.prisma.working.purchaseRFQ.findFirst({ where: { id, tenantId } });
    if (!rfq) throw new NotFoundException('RFQ not found');
    return this.prisma.working.purchaseRFQ.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.working.purchaseRFQ.count({ where: { tenantId } });
    return `RFQ-${String(count + 1).padStart(5, '0')}`;
  }
}
