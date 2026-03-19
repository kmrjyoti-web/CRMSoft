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
      this.prisma.goodsReceipt.findMany({
        where,
        include: {
          po: { select: { id: true, poNumber: true, vendorId: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.goodsReceipt.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(tenantId: string, id: string) {
    const grn = await this.prisma.goodsReceipt.findFirst({
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
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.purchaseOrderId, tenantId },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    if (!['APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status)) {
      throw new BadRequestException('PO must be approved before receiving goods');
    }

    return this.prisma.goodsReceipt.create({
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
    const grn = await this.prisma.goodsReceipt.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!grn) throw new NotFoundException('Goods receipt not found');
    if (!['DRAFT', 'INSPECTED'].includes(grn.status)) {
      throw new BadRequestException('GRN cannot be accepted in current status');
    }

    await this.prisma.goodsReceipt.update({
      where: { id },
      data: { status: 'ACCEPTED', inspectedById: userId, inventoryUpdated: true },
    });

    // Update inventory — Challan accepted → stock IN
    for (const item of grn.items) {
      const acceptedQty = item.acceptedQty?.toNumber() ?? item.receivedQty.toNumber();
      if (acceptedQty > 0 && (item.locationId || grn.locationId)) {
        await this.transactionService.record(tenantId, {
          productId: item.productId,
          transactionType: 'PURCHASE_IN',
          quantity: acceptedQty,
          locationId: item.locationId ?? grn.locationId,
          referenceType: 'GOODS_RECEIPT',
          referenceId: grn.id,
          remarks: `GRN ${grn.receiptNumber} accepted`,
          createdById: userId,
        });
      }

      // Move rejected to scrap store
      const rejectedQty = item.rejectedQty?.toNumber() ?? 0;
      if (rejectedQty > 0 && item.locationId) {
        const location = await this.prisma.stockLocation.findFirst({
          where: { id: item.locationId, tenantId },
        });
        if (location) {
          const scrapStore = await this.prisma.stockLocation.findFirst({
            where: { tenantId, code: `${location.code}-S` },
          });
          if (scrapStore) {
            await this.transactionService.record(tenantId, {
              productId: item.productId,
              transactionType: 'SCRAP_IN',
              quantity: rejectedQty,
              locationId: scrapStore.id,
              referenceType: 'GOODS_RECEIPT',
              referenceId: grn.id,
              remarks: `Rejected: ${item.rejectionReason ?? 'Quality issue'}`,
              createdById: userId,
            });
          }
        }
      }

      // Update PO item received quantity
      if (item.poItemId) {
        await this.prisma.purchaseOrderItem.update({
          where: { id: item.poItemId },
          data: { receivedQty: { increment: acceptedQty } },
        });
      }
    }

    // Check if PO fully received
    if (grn.poId) {
      const poItems = await this.prisma.purchaseOrderItem.findMany({
        where: { poId: grn.poId },
      });
      const allReceived = poItems.every((pi) => pi.receivedQty.toNumber() >= pi.orderedQty.toNumber());

      await this.prisma.purchaseOrder.update({
        where: { id: grn.poId },
        data: { status: allReceived ? 'COMPLETED' : 'PARTIALLY_RECEIVED' },
      });
    }

    return this.getById(tenantId, id);
  }

  async reject(tenantId: string, id: string, userId: string, remarks?: string) {
    const grn = await this.prisma.goodsReceipt.findFirst({ where: { id, tenantId } });
    if (!grn) throw new NotFoundException('Goods receipt not found');

    return this.prisma.goodsReceipt.update({
      where: { id },
      data: {
        status: 'REJECTED',
        inspectedById: userId,
        remarks: remarks ? `${grn.remarks ?? ''}\nRejected: ${remarks}` : grn.remarks,
      },
    });
  }

  async generateNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.goodsReceipt.count({ where: { tenantId } });
    return `GRN-${String(count + 1).padStart(5, '0')}`;
  }
}
