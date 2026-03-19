import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class PurchaseQuotationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, filters?: {
    rfqId?: string; vendorId?: string; status?: string; page?: number; limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.rfqId) where.rfqId = filters.rfqId;
    if (filters?.vendorId) where.vendorId = filters.vendorId;
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.purchaseQuotation.findMany({
        where,
        include: {
          rfq: { select: { id: true, rfqNumber: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseQuotation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(tenantId: string, id: string) {
    const quotation = await this.prisma.purchaseQuotation.findFirst({
      where: { id, tenantId },
      include: {
        rfq: { select: { id: true, rfqNumber: true } },
        items: true,
      },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async create(tenantId: string, userId: string, dto: {
    rfqId: string; vendorId: string; quotationNumber: string;
    validUntil?: string; paymentTermDays?: number; notes?: string;
    items: Array<{
      rfqItemId: string; productId: string; quantity: number;
      unitPrice: number; discount?: number; taxRate?: number;
      unitId?: string; deliveryDays?: number;
    }>;
  }) {
    let subtotal = 0;
    let taxTotal = 0;

    const itemsData = dto.items.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const disc = item.discount ?? 0;
      const afterDiscount = lineTotal - (lineTotal * disc / 100);
      const tax = afterDiscount * ((item.taxRate ?? 0) / 100);
      const total = afterDiscount + tax;

      subtotal += afterDiscount;
      taxTotal += tax;

      return {
        tenantId,
        productId: item.productId,
        quantity: item.quantity,
        unitId: item.unitId ?? '',
        unitPrice: item.unitPrice,
        discount: item.discount ?? 0,
        taxRate: item.taxRate ?? 0,
        taxAmount: tax,
        totalAmount: total,
      };
    });

    return this.prisma.purchaseQuotation.create({
      data: {
        tenantId,
        rfqId: dto.rfqId,
        vendorId: dto.vendorId,
        quotationNumber: dto.quotationNumber,
        quotationDate: new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        creditDays: dto.paymentTermDays,
        subtotal,
        taxAmount: taxTotal,
        grandTotal: subtotal + taxTotal,
        status: 'RECEIVED',
        remarks: dto.notes,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    const quotation = await this.prisma.purchaseQuotation.findFirst({ where: { id, tenantId } });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return this.prisma.purchaseQuotation.update({ where: { id }, data: { status } });
  }

  async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.purchaseQuotation.count({ where: { tenantId } });
    return `PQ-${String(count + 1).padStart(5, '0')}`;
  }
}
