import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateSaleOrderDto, UpdateSaleOrderDto } from '../presentation/dto/sales.dto';

@Injectable()
export class SaleOrderService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ───

  async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.saleOrder.count({
      where: { tenantId, orderNumber: { startsWith: `SO-${year}-` } },
    });
    return `SO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private calculateItemTotal(item: {
    orderedQty: number; unitPrice: number; discount?: number; taxRate?: number;
  }) {
    const lineTotal = item.orderedQty * item.unitPrice;
    const discAmount = item.discount ?? 0;
    const taxableAmount = lineTotal - discAmount;
    const taxAmount = taxableAmount * ((item.taxRate ?? 0) / 100);
    const totalAmount = taxableAmount + taxAmount;
    return { lineTotal, discAmount, taxableAmount, taxAmount, totalAmount };
  }

  private computeTotals<T extends {
    orderedQty: number; unitPrice: number; discount?: number; taxRate?: number; taxType?: string;
  }>(items: T[]) {
    let subtotal = 0;
    let discountAmount = 0;
    let taxableAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    const computed = items.map((item) => {
      const calc = this.calculateItemTotal(item);
      subtotal += calc.lineTotal;
      discountAmount += calc.discAmount;
      taxableAmount += calc.taxableAmount;

      // Split tax based on taxType
      if (item.taxType === 'IGST') {
        igstAmount += calc.taxAmount;
      } else {
        cgstAmount += calc.taxAmount / 2;
        sgstAmount += calc.taxAmount / 2;
      }

      return { ...item, taxAmount: calc.taxAmount, totalAmount: calc.totalAmount };
    });

    const grandTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;
    return { computed, subtotal, discountAmount, taxableAmount, cgstAmount, sgstAmount, igstAmount, grandTotal };
  }

  // ─── CRUD ───

  async create(tenantId: string, userId: string, dto: CreateSaleOrderDto) {
    const orderNumber = await this.generateNumber(tenantId);

    let itemsInput = dto.items;

    // If quotationId provided, copy items from quotation
    if (dto.quotationId) {
      const quotation = await this.prisma.quotation.findFirst({
        where: { id: dto.quotationId, tenantId },
        include: { lineItems: true },
      });
      if (quotation && quotation.lineItems.length > 0) {
        itemsInput = quotation.lineItems.map((qi: any) => ({
          productId: qi.productId,
          orderedQty: Number(qi.quantity),
          unitId: qi.unitId ?? '',
          unitPrice: Number(qi.unitPrice),
          discount: qi.discount ? Number(qi.discount) : undefined,
          taxRate: qi.taxRate ? Number(qi.taxRate) : undefined,
          taxType: qi.taxType ?? undefined,
          hsnCode: qi.hsnCode ?? undefined,
        }));
      }
    }

    const { computed, subtotal, discountAmount, taxableAmount, cgstAmount, sgstAmount, igstAmount, grandTotal } =
      this.computeTotals(itemsInput);

    return this.prisma.saleOrder.create({
      data: {
        tenantId,
        orderNumber,
        quotationId: dto.quotationId,
        customerId: dto.customerId,
        customerType: dto.customerType,
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
        deliveryLocationId: dto.deliveryLocationId,
        creditDays: dto.creditDays,
        paymentTerms: dto.paymentTerms,
        remarks: dto.remarks,
        subtotal,
        discountAmount,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        grandTotal,
        completionPercent: 0,
        status: 'DRAFT',
        createdById: userId,
        items: {
          create: computed.map((item) => ({
            productId: item.productId,
            orderedQty: item.orderedQty,
            pendingQty: item.orderedQty,
            unitId: item.unitId,
            unitPrice: item.unitPrice,
            discount: item.discount ?? 0,
            taxRate: item.taxRate ?? 0,
            taxType: item.taxType,
            taxAmount: item.taxAmount,
            hsnCode: item.hsnCode,
            totalAmount: item.totalAmount,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll(tenantId: string, filters?: { status?: string; customerId?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;

    const [data, total] = await Promise.all([
      this.prisma.saleOrder.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.saleOrder.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string) {
    const order = await this.prisma.saleOrder.findFirst({
      where: { id, tenantId },
      include: {
        items: true,
        deliveryChallans: { include: { items: true } },
      },
    });
    if (!order) throw new NotFoundException('Sale order not found');
    return order;
  }

  async update(tenantId: string, id: string, dto: UpdateSaleOrderDto) {
    const order = await this.prisma.saleOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new NotFoundException('Sale order not found');
    if (order.status !== 'DRAFT') throw new BadRequestException('Only DRAFT orders can be updated');

    const data: any = {};
    if (dto.expectedDeliveryDate !== undefined) {
      data.expectedDeliveryDate = dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null;
    }
    if (dto.deliveryLocationId !== undefined) data.deliveryLocationId = dto.deliveryLocationId;
    if (dto.creditDays !== undefined) data.creditDays = dto.creditDays;
    if (dto.paymentTerms !== undefined) data.paymentTerms = dto.paymentTerms;
    if (dto.remarks !== undefined) data.remarks = dto.remarks;

    // If items changed, recalculate totals
    if (dto.items && dto.items.length > 0) {
      const { computed, subtotal, discountAmount, taxableAmount, cgstAmount, sgstAmount, igstAmount, grandTotal } =
        this.computeTotals(dto.items);

      // Delete old items and create new ones
      await this.prisma.saleOrderItem.deleteMany({ where: { saleOrderId: id } });

      data.subtotal = subtotal;
      data.discountAmount = discountAmount;
      data.taxableAmount = taxableAmount;
      data.cgstAmount = cgstAmount;
      data.sgstAmount = sgstAmount;
      data.igstAmount = igstAmount;
      data.grandTotal = grandTotal;
      data.items = {
        create: computed.map((item) => ({
          productId: item.productId,
          orderedQty: item.orderedQty,
          pendingQty: item.orderedQty,
          unitId: item.unitId,
          unitPrice: item.unitPrice,
          discount: item.discount ?? 0,
          taxRate: item.taxRate ?? 0,
          taxType: item.taxType,
          taxAmount: item.taxAmount,
          hsnCode: item.hsnCode,
          totalAmount: item.totalAmount,
        })),
      };
    }

    return this.prisma.saleOrder.update({ where: { id }, data, include: { items: true } });
  }

  async approve(tenantId: string, id: string, userId: string) {
    const order = await this.prisma.saleOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new NotFoundException('Sale order not found');
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(order.status)) {
      throw new BadRequestException('Only DRAFT or PENDING_APPROVAL orders can be approved');
    }

    return this.prisma.saleOrder.update({
      where: { id },
      data: { status: 'CONFIRMED', approvedById: userId, approvedAt: new Date() },
    });
  }

  async reject(tenantId: string, id: string, reason: string) {
    const order = await this.prisma.saleOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new NotFoundException('Sale order not found');

    return this.prisma.saleOrder.update({
      where: { id },
      data: { status: 'CANCELLED', remarks: reason ? `${order.remarks ?? ''}\nRejected: ${reason}` : order.remarks },
    });
  }

  async cancel(tenantId: string, id: string) {
    const order = await this.prisma.saleOrder.findFirst({
      where: { id, tenantId },
      include: { deliveryChallans: { where: { status: { not: 'CANCELLED' } } } },
    });
    if (!order) throw new NotFoundException('Sale order not found');
    if (order.deliveryChallans.length > 0) {
      throw new BadRequestException('Cannot cancel order with active deliveries');
    }
    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel completed/cancelled order');
    }

    return this.prisma.saleOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async convertToInvoice(tenantId: string, id: string, userId: string) {
    const order = await this.prisma.saleOrder.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Sale order not found');
    if (order.status !== 'CONFIRMED') {
      throw new BadRequestException('Only CONFIRMED orders can be converted to invoice');
    }

    // Return data ready for invoice creation
    return {
      saleOrderId: order.id,
      customerId: order.customerId,
      customerType: order.customerType,
      subtotal: order.subtotal,
      taxableAmount: order.taxableAmount,
      cgstAmount: order.cgstAmount,
      sgstAmount: order.sgstAmount,
      igstAmount: order.igstAmount,
      grandTotal: order.grandTotal,
      creditDays: order.creditDays,
      paymentTerms: order.paymentTerms,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.orderedQty,
        unitId: item.unitId,
        unitPrice: item.unitPrice,
        discount: item.discount,
        taxRate: item.taxRate,
        taxType: item.taxType,
        taxAmount: item.taxAmount,
        hsnCode: item.hsnCode,
        totalAmount: item.totalAmount,
      })),
    };
  }

  async updateDeliveryProgress(tenantId: string, orderId: string) {
    const order = await this.prisma.saleOrder.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });
    if (!order) return;

    let totalOrdered = 0;
    let totalDelivered = 0;

    for (const item of order.items) {
      totalOrdered += Number(item.orderedQty);
      totalDelivered += Number(item.deliveredQty);
    }

    const completionPercent = totalOrdered > 0 ? Math.round((totalDelivered / totalOrdered) * 10000) / 100 : 0;
    const status = completionPercent >= 100 ? 'COMPLETED' : order.status;

    await this.prisma.saleOrder.update({
      where: { id: orderId },
      data: { completionPercent, status },
    });
  }
}
