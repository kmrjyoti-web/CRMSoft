import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TransactionService } from '../../../customer/inventory/services/transaction.service';

@Injectable()
export class GoodsReceiptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async list(tenantId: string, filters?: {
    purchaseOrderId?: string; status?: string; page?: number; limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.purchaseOrderId) where.poId = filters.purchaseOrderId;
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.working.goodsReceipt.findMany({
        where,
        include: {
          po: { select: { id: true, poNumber: true, vendorId: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.goodsReceipt.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(tenantId: string, id: string) {
    const grn = await this.prisma.working.goodsReceipt.findFirst({
      where: { id, tenantId },
      include: {
        po: { select: { id: true, poNumber: true, vendorId: true } },
        items: true,
      },
    });
    if (!grn) throw new NotFoundException('Goods receipt not found');
    return grn;
  }

  async create(tenantId: string, userId: string, dto: {
    grnNumber: string; purchaseOrderId: string;
    challanNumber?: string; challanDate?: string; vehicleNumber?: string;
    receivingLocationId?: string; notes?: string;
    items: Array<{
      poItemId: string; productId: string; receivedQty: number;
      acceptedQty?: number; rejectedQty?: number; rejectionReason?: string;
      locationId?: string; batchNo?: string; expiryDate?: string;
    }>;
  }) {
    const po = await this.prisma.working.purchaseOrder.findFirst({
      where: { id: dto.purchaseOrderId, tenantId },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (!['APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status)) {
      throw new BadRequestException('PO must be approved before receiving goods');
    }

    return this.prisma.working.goodsReceipt.create({
      data: {
        tenantId,
        receiptType: 'GRN',
        receiptNumber: dto.grnNumber,
        vendorId: po.vendorId,
        poId: dto.purchaseOrderId,
        locationId: dto.receivingLocationId ?? '',
        status: 'DRAFT',
        vendorChallanNo: dto.challanNumber,
        createdById: userId,
        remarks: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            tenantId,
            productId: item.productId,
            poItemId: item.poItemId,
            receivedQty: item.receivedQty,
            acceptedQty: item.acceptedQty ?? item.receivedQty,
            rejectedQty: item.rejectedQty ?? 0,
            unitId: '',
            rejectionReason: item.rejectionReason,
            locationId: item.locationId ?? dto.receivingLocationId,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          })),
        },
      },
      include: { items: true },
    });
  }

  async accept(tenantId: string, id: string, userId: string) {
    const grn = await this.prisma.working.goodsReceipt.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!grn) throw new NotFoundException('Goods receipt not found');
    if (!['DRAFT', 'INSPECTED'].includes(grn.status)) {
      throw new BadRequestException('GRN cannot be accepted in current status');
    }

    await this.prisma.working.goodsReceipt.update({
      where: { id },
      data: { status: 'ACCEPTED', inspectedById: userId, inventoryUpdated: true },
    });

