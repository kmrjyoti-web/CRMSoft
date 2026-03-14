import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { InventoryService } from './inventory.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async record(tenantId: string, dto: {
    productId: string;
    transactionType: string;
    quantity: number;
    locationId: string;
    toLocationId?: string;
    unitPrice?: number;
    serialMasterId?: string;
    batchId?: string;
    referenceType?: string;
    referenceId?: string;
    remarks?: string;
    createdById?: string;
  }) {
    const item = await this.inventoryService.getOrCreateItem(tenantId, dto.productId);

    // Determine signed quantity
    const outTypes = ['SALE_OUT', 'DAMAGE', 'WRITE_OFF', 'PRODUCTION_OUT', 'SCRAP'];
    const signedQty = outTypes.includes(dto.transactionType)
      ? -Math.abs(dto.quantity)
      : Math.abs(dto.quantity);

    const totalAmount = dto.unitPrice ? dto.unitPrice * Math.abs(dto.quantity) : undefined;

    const txn = await this.prisma.stockTransaction.create({
      data: {
        tenantId,
        inventoryItemId: item.id,
        productId: dto.productId,
        transactionType: dto.transactionType as any,
        quantity: signedQty,
        unitPrice: dto.unitPrice,
        totalAmount,
        locationId: dto.locationId,
        toLocationId: dto.toLocationId,
        serialMasterId: dto.serialMasterId,
        batchId: dto.batchId,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        remarks: dto.remarks,
        createdById: dto.createdById,
      },
    });

    // Update inventory item stock
    await this.prisma.inventoryItem.update({
      where: { id: item.id },
      data: { currentStock: { increment: signedQty } },
    });

    // Update stock summary
    await this.updateSummary(tenantId, dto.productId, dto.locationId, item.id, signedQty);

    return txn;
  }

  async list(tenantId: string, filters: {
    productId?: string;
    transactionType?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const where: any = { tenantId };

    if (filters.productId) where.productId = filters.productId;
    if (filters.transactionType) where.transactionType = filters.transactionType;
    if (filters.locationId) where.locationId = filters.locationId;
    if (filters.startDate || filters.endDate) {
      where.transactionDate = {};
      if (filters.startDate) where.transactionDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.transactionDate.lte = new Date(filters.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.stockTransaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { inventoryItem: true },
      }),
      this.prisma.stockTransaction.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getLedger(tenantId: string, productId: string, filters?: {
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = { tenantId, productId };
    if (filters?.locationId) where.locationId = filters.locationId;
    if (filters?.startDate || filters?.endDate) {
      where.transactionDate = {};
      if (filters?.startDate) where.transactionDate.gte = new Date(filters.startDate);
      if (filters?.endDate) where.transactionDate.lte = new Date(filters.endDate);
    }

    const transactions = await this.prisma.stockTransaction.findMany({
      where,
      orderBy: { transactionDate: 'asc' },
    });

    // Build running balance ledger
    let runningBalance = 0;
    const ledger = transactions.map((txn) => {
      runningBalance += txn.quantity;
      return {
        ...txn,
        runningBalance,
      };
    });

    return ledger;
  }

  async getBySerial(tenantId: string, serialId: string) {
    return this.prisma.stockTransaction.findMany({
      where: { tenantId, serialMasterId: serialId },
      orderBy: { transactionDate: 'asc' },
    });
  }

  async transfer(tenantId: string, dto: {
    productId: string;
    quantity: number;
    fromLocationId: string;
    toLocationId: string;
    unitPrice?: number;
    remarks?: string;
    createdById?: string;
  }) {
    const item = await this.inventoryService.getOrCreateItem(tenantId, dto.productId);

    // Outbound transaction
    const outTxn = await this.prisma.stockTransaction.create({
      data: {
        tenantId,
        inventoryItemId: item.id,
        productId: dto.productId,
        transactionType: 'TRANSFER',
        quantity: -Math.abs(dto.quantity),
        unitPrice: dto.unitPrice,
        locationId: dto.fromLocationId,
        toLocationId: dto.toLocationId,
        remarks: dto.remarks ? `Transfer OUT: ${dto.remarks}` : 'Transfer OUT',
        createdById: dto.createdById,
      },
    });

    // Inbound transaction
    const inTxn = await this.prisma.stockTransaction.create({
      data: {
        tenantId,
        inventoryItemId: item.id,
        productId: dto.productId,
        transactionType: 'TRANSFER',
        quantity: Math.abs(dto.quantity),
        unitPrice: dto.unitPrice,
        locationId: dto.toLocationId,
        toLocationId: dto.fromLocationId,
        remarks: dto.remarks ? `Transfer IN: ${dto.remarks}` : 'Transfer IN',
        createdById: dto.createdById,
      },
    });

    // Update summaries for both locations
    await this.updateSummary(tenantId, dto.productId, dto.fromLocationId, item.id, -Math.abs(dto.quantity));
    await this.updateSummary(tenantId, dto.productId, dto.toLocationId, item.id, Math.abs(dto.quantity));

    return { outbound: outTxn, inbound: inTxn };
  }

  private async updateSummary(tenantId: string, productId: string, locationId: string, inventoryItemId: string, quantityChange: number) {
    const existing = await this.prisma.stockSummary.findUnique({
      where: { tenantId_productId_locationId: { tenantId, productId, locationId } },
    });

    if (existing) {
      const update: any = { lastUpdatedAt: new Date() };
      if (quantityChange > 0) {
        update.totalIn = { increment: quantityChange };
        update.currentStock = { increment: quantityChange };
      } else {
        update.totalOut = { increment: Math.abs(quantityChange) };
        update.currentStock = { increment: quantityChange };
      }
      await this.prisma.stockSummary.update({ where: { id: existing.id }, data: update });
    } else {
      await this.prisma.stockSummary.create({
        data: {
          tenantId,
          productId,
          locationId,
          inventoryItemId,
          totalIn: quantityChange > 0 ? quantityChange : 0,
          totalOut: quantityChange < 0 ? Math.abs(quantityChange) : 0,
          currentStock: quantityChange,
          lastUpdatedAt: new Date(),
        },
      });
    }
  }
}
