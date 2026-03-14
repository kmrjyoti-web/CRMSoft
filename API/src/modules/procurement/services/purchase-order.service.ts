import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class PurchaseOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, filters?: {
    vendorId?: string; status?: string; page?: number; limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.vendorId) where.vendorId = filters.vendorId;
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          items: true,
          _count: { select: { goodsReceipts: true, purchaseInvoices: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(tenantId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        items: true,
        goodsReceipts: { select: { id: true, receiptNumber: true, status: true, createdAt: true } },
        purchaseInvoices: { select: { id: true, ourReference: true, status: true, grandTotal: true } },
      },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async create(tenantId: string, userId: string, dto: {
    poNumber: string; vendorId: string; quotationId?: string;
    expectedDate?: string; paymentTermDays?: number;
    deliveryAddress?: string; notes?: string;
    items: Array<{
      productId: string; quantity: number; unitPrice: number;
      discount?: number; taxRate?: number; unitId?: string;
      expectedDeliveryDate?: string;
    }>;
  }) {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    const itemsData = dto.items.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const disc = item.discount ?? 0;
      const discAmount = lineTotal * (disc / 100);
      const afterDiscount = lineTotal - discAmount;
      const tax = afterDiscount * ((item.taxRate ?? 0) / 100);
      const total = afterDiscount + tax;

      subtotal += afterDiscount;
      taxTotal += tax;
      discountTotal += discAmount;

      return {
        productId: item.productId,
        orderedQty: item.quantity,
        pendingQty: item.quantity,
        unitId: item.unitId ?? '',
        unitPrice: item.unitPrice,
        discount: item.discount ?? 0,
        taxRate: item.taxRate ?? 0,
        taxAmount: tax,
        totalAmount: total,
      };
    });

    return this.prisma.purchaseOrder.create({
      data: {
        tenantId,
        poNumber: dto.poNumber,
        vendorId: dto.vendorId,
        quotationId: dto.quotationId,
        expectedDeliveryDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
        creditDays: dto.paymentTermDays,
        remarks: dto.notes,
        subtotal,
        taxAmount: taxTotal,
        discountAmount: discountTotal,
        grandTotal: subtotal + taxTotal,
        status: 'DRAFT',
        createdById: userId,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  async update(tenantId: string, id: string, dto: {
    expectedDate?: string; deliveryAddress?: string; notes?: string; status?: string;
  }) {
    const po = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!po) throw new NotFoundException('Purchase order not found');

    const data: any = {};
    if (dto.expectedDate !== undefined) data.expectedDeliveryDate = dto.expectedDate ? new Date(dto.expectedDate) : null;
    if (dto.notes !== undefined) data.remarks = dto.notes;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.purchaseOrder.update({ where: { id }, data });
  }

  async submitForApproval(tenantId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (po.status !== 'DRAFT') throw new BadRequestException('Only draft POs can be submitted');

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
    });
  }

  async approve(tenantId: string, id: string, userId: string) {
    const po = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (po.status !== 'PENDING_APPROVAL') throw new BadRequestException('PO not pending approval');

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
    });
  }

  async reject(tenantId: string, id: string, userId: string, remarks?: string) {
    const po = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!po) throw new NotFoundException('Purchase order not found');

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'REJECTED', remarks: remarks ? `${po.remarks ?? ''}\nRejected: ${remarks}` : po.remarks },
    });
  }

  async cancel(tenantId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (['COMPLETED', 'CANCELLED'].includes(po.status)) {
      throw new BadRequestException('Cannot cancel completed/cancelled PO');
    }
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.purchaseOrder.count({ where: { tenantId } });
    return `PO-${String(count + 1).padStart(5, '0')}`;
  }
}
