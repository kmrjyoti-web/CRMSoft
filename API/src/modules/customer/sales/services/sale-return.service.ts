import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CreditNoteEnhancedService } from './credit-note-enhanced.service';
import { CreateSaleReturnDto, InspectReturnDto } from '../presentation/dto/sales.dto';

@Injectable()
export class SaleReturnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditNoteService: CreditNoteEnhancedService,
  ) {}

  async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.saleReturn.count({
      where: { tenantId, returnNumber: { startsWith: `SR-${year}-` } },
    });
    return `SR-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private calculateItemTotal(item: { returnedQty: number; unitPrice: number; taxRate?: number }) {
    const lineTotal = item.returnedQty * item.unitPrice;
    const taxAmount = lineTotal * ((item.taxRate ?? 0) / 100);
    const totalAmount = lineTotal + taxAmount;
    return { lineTotal, taxAmount, totalAmount };
  }

  async create(tenantId: string, userId: string, dto: CreateSaleReturnDto) {
    const returnNumber = await this.generateNumber(tenantId);

    let subtotal = 0;
    let taxAmount = 0;

    const itemsData = dto.items.map((item) => {
      const calc = this.calculateItemTotal(item);
      subtotal += calc.lineTotal;
      taxAmount += calc.taxAmount;

      return {
        tenantId,
        productId: item.productId,
        returnedQty: item.returnedQty,
        unitId: item.unitId,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate ?? 0,
        taxAmount: calc.taxAmount,
        totalAmount: calc.totalAmount,
        hsnCode: item.hsnCode,
        returnReason: item.returnReason,
        condition: item.condition,
        batchNo: item.batchNo,
        serialNos: item.serialNos ?? undefined,
      };
    });

    const grandTotal = subtotal + taxAmount;

    return this.prisma.saleReturn.create({
      data: {
        tenantId,
        returnNumber,
        customerId: dto.customerId,
        customerType: dto.customerType,
        saleOrderId: dto.saleOrderId,
        invoiceId: dto.invoiceId,
        returnReason: dto.returnReason,
        receiveLocationId: dto.receiveLocationId,
        remarks: dto.remarks,
        subtotal,
        taxAmount,
        grandTotal,
        status: 'DRAFT',
        createdById: userId,
        items: { create: itemsData },
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
      this.prisma.saleReturn.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.saleReturn.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string) {
    const saleReturn = await this.prisma.saleReturn.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');
    return saleReturn;
  }

  async inspect(tenantId: string, id: string, dto: InspectReturnDto) {
    const saleReturn = await this.prisma.saleReturn.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');
    if (saleReturn.status !== 'DRAFT') throw new BadRequestException('Only DRAFT returns can be inspected');

    for (const inspection of dto.inspections) {
      const item = saleReturn.items.find((i) => i.id === inspection.itemId);
      if (!item) throw new BadRequestException(`Return item ${inspection.itemId} not found`);

      await this.prisma.saleReturnItem.update({
        where: { id: inspection.itemId },
        data: {
          acceptedQty: inspection.acceptedQty,
          rejectedQty: inspection.rejectedQty,
          condition: inspection.condition ?? item.condition,
        },
      });
    }

    return this.prisma.saleReturn.update({
      where: { id },
      data: { status: 'INSPECTED' },
      include: { items: true },
    });
  }

  async accept(tenantId: string, id: string, userId: string) {
    const saleReturn = await this.prisma.saleReturn.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');
    if (!['DRAFT', 'INSPECTED'].includes(saleReturn.status)) {
      throw new BadRequestException('Only DRAFT or INSPECTED returns can be accepted');
    }

    // Stock IN for accepted items
    for (const item of saleReturn.items) {
      const acceptedQty = item.acceptedQty ? Number(item.acceptedQty) : Number(item.returnedQty);
      if (acceptedQty <= 0) continue;

      const locationId = saleReturn.receiveLocationId;

      // Find inventory item
      const inventoryItem = await this.prisma.inventoryItem.findFirst({
        where: { tenantId, productId: item.productId },
      });

      if (inventoryItem && locationId) {
        await this.prisma.stockTransaction.create({
          data: {
            tenantId,
            inventoryItemId: inventoryItem.id,
            productId: item.productId,
            transactionType: 'RETURN_IN',
            quantity: acceptedQty,
            locationId,
            referenceType: 'SALE_RETURN',
            referenceId: saleReturn.id,
            transactionDate: new Date(),
            createdById: userId,
          },
        });

        // Update inventory item stock
        await this.prisma.inventoryItem.updateMany({
          where: { tenantId, productId: item.productId },
          data: { currentStock: { increment: acceptedQty } },
        });

        // Update stock summary
        await this.prisma.stockSummary.updateMany({
          where: { tenantId, productId: item.productId, locationId },
          data: {
            totalIn: { increment: acceptedQty },
            currentStock: { increment: acceptedQty },
          },
        });
      }

      // If saleOrderId linked: update SaleOrderItem.returnedQty
      if (saleReturn.saleOrderId) {
        // Find the matching sale order item by productId
        const soItem = await this.prisma.saleOrderItem.findFirst({
          where: { saleOrder: { id: saleReturn.saleOrderId }, productId: item.productId },
        });
        if (soItem) {
          await this.prisma.saleOrderItem.update({
            where: { id: soItem.id },
            data: { returnedQty: { increment: acceptedQty } },
          });
        }
      }
    }

    // Update sale return status
    const updated = await this.prisma.saleReturn.update({
      where: { id },
      data: { status: 'ACCEPTED', inventoryUpdated: true },
      include: { items: true },
    });

    // Auto-generate credit note
    try {
      const creditNote = await this.creditNoteService.createFromReturn(tenantId, userId, updated);
      if (creditNote) {
        await this.prisma.saleReturn.update({
          where: { id },
          data: { creditNoteId: creditNote.id },
        });
      }
    } catch {
      // Credit note creation is best-effort; sale return acceptance should still succeed
    }

    return updated;
  }

  async reject(tenantId: string, id: string) {
    const saleReturn = await this.prisma.saleReturn.findFirst({ where: { id, tenantId } });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    return this.prisma.saleReturn.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }
}
