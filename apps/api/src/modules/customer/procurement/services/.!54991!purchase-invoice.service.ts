import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TransactionService } from '../../../customer/inventory/services/transaction.service';

@Injectable()
export class PurchaseInvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async list(tenantId: string, filters?: {
    vendorId?: string; status?: string; purchaseOrderId?: string;
    page?: number; limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.vendorId) where.vendorId = filters.vendorId;
    if (filters?.status) where.status = filters.status;
    if (filters?.purchaseOrderId) where.poId = filters.purchaseOrderId;

    const [data, total] = await Promise.all([
      this.prisma.working.purchaseInvoice.findMany({
        where,
        include: {
          po: { select: { id: true, poNumber: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.purchaseInvoice.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(tenantId: string, id: string) {
    const invoice = await this.prisma.working.purchaseInvoice.findFirst({
      where: { id, tenantId },
      include: {
        po: { select: { id: true, poNumber: true } },
        items: true,
      },
    });
    if (!invoice) throw new NotFoundException('Purchase invoice not found');
    return invoice;
  }

  async create(tenantId: string, userId: string, dto: {
    invoiceNumber: string; vendorId: string;
    purchaseOrderId?: string; goodsReceiptId?: string;
    vendorInvoiceNo: string; vendorInvoiceDate?: string; dueDate?: string;
    notes?: string;
    items: Array<{
      productId: string; quantity: number; unitPrice: number;
      discount?: number; taxRate?: number; grnItemId?: string;
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
        unitId: '',
        unitPrice: item.unitPrice,
        discount: item.discount ?? 0,
        taxableAmount: afterDiscount,
        totalAmount: total,
        poItemId: item.grnItemId,
      };
    });

    return this.prisma.working.purchaseInvoice.create({
      data: {
        tenantId,
        ourReference: dto.invoiceNumber,
        vendorId: dto.vendorId,
        poId: dto.purchaseOrderId,
        goodsReceiptId: dto.goodsReceiptId,
        vendorInvoiceNo: dto.vendorInvoiceNo,
        invoiceDate: dto.vendorInvoiceDate ? new Date(dto.vendorInvoiceDate) : new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        subtotal,
        taxableAmount: subtotal,
        grandTotal: subtotal + taxTotal,
        balanceAmount: subtotal + taxTotal,
        status: 'DRAFT',
        createdById: userId,
        remarks: dto.notes,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  async approve(tenantId: string, id: string, userId: string) {
    const invoice = await this.prisma.working.purchaseInvoice.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!invoice) throw new NotFoundException('Purchase invoice not found');
    if (invoice.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Invoice not pending approval');
    }

    // Smart rule: Invoice with GRN ? accounts only. Without GRN ? both
    const hasChallan = !!invoice.goodsReceiptId;

    if (!hasChallan) {
