import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SaleOrderService } from './sale-order.service';
import { CreateDeliveryChallanDto } from '../presentation/dto/sales.dto';

@Injectable()
export class DeliveryChallanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly saleOrderService: SaleOrderService,
  ) {}

  async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.deliveryChallan.count({
      where: { tenantId, challanNumber: { startsWith: `DC-${year}-` } },
    });
    return `DC-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(tenantId: string, userId: string, dto: CreateDeliveryChallanDto) {
    const challanNumber = await this.generateNumber(tenantId);

    // Validate against sale order pending quantities if linked
    if (dto.saleOrderId) {
      const saleOrder = await this.prisma.saleOrder.findFirst({
        where: { id: dto.saleOrderId, tenantId },
        include: { items: true },
      });
      if (!saleOrder) throw new NotFoundException('Sale order not found');
      if (!['CONFIRMED', 'PARTIALLY_DELIVERED'].includes(saleOrder.status)) {
        throw new BadRequestException('Sale order must be CONFIRMED or PARTIALLY_DELIVERED for delivery');
      }

      for (const dcItem of dto.items) {
        if (dcItem.saleOrderItemId) {
          const soItem = saleOrder.items.find((si) => si.id === dcItem.saleOrderItemId);
          if (!soItem) throw new BadRequestException(`Sale order item ${dcItem.saleOrderItemId} not found`);
          if (dcItem.quantity > Number(soItem.pendingQty)) {
            throw new BadRequestException(
              `Delivery quantity (${dcItem.quantity}) exceeds pending quantity (${soItem.pendingQty}) for product ${dcItem.productId}`,
            );
          }
        }
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of dto.items) {
      if (item.unitPrice) {
        totalAmount += item.quantity * item.unitPrice;
      }
    }

    return this.prisma.deliveryChallan.create({
      data: {
        tenantId,
        challanNumber,
        saleOrderId: dto.saleOrderId,
        customerId: dto.customerId,
        customerType: dto.customerType,
        fromLocationId: dto.fromLocationId,
        transporterName: dto.transporterName,
        vehicleNumber: dto.vehicleNumber,
        lrNumber: dto.lrNumber,
        ewayBillNumber: dto.ewayBillNumber,
        ewayBillDate: dto.ewayBillDate ? new Date(dto.ewayBillDate) : null,
        totalAmount: totalAmount > 0 ? totalAmount : null,
        remarks: dto.remarks,
        status: 'DRAFT',
        createdById: userId,
        items: {
          create: dto.items.map((item) => ({
            tenantId,
            productId: item.productId,
            saleOrderItemId: item.saleOrderItemId,
            quantity: item.quantity,
            unitId: item.unitId,
            unitPrice: item.unitPrice,
            batchNo: item.batchNo,
            serialNos: item.serialNos ?? undefined,
            fromLocationId: item.fromLocationId,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll(tenantId: string, filters?: { status?: string; customerId?: string; saleOrderId?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.saleOrderId) where.saleOrderId = filters.saleOrderId;

    const [data, total] = await Promise.all([
      this.prisma.deliveryChallan.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.deliveryChallan.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string) {
    const challan = await this.prisma.deliveryChallan.findFirst({
      where: { id, tenantId },
      include: { items: true, saleOrder: { select: { id: true, orderNumber: true, status: true } } },
    });
    if (!challan) throw new NotFoundException('Delivery challan not found');
    return challan;
  }

  async dispatch(tenantId: string, id: string, userId: string) {
    const challan = await this.prisma.deliveryChallan.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!challan) throw new NotFoundException('Delivery challan not found');
    if (challan.status !== 'DRAFT') throw new BadRequestException('Only DRAFT challans can be dispatched');

    // Stock OUT for each item
    for (const item of challan.items) {
      const locationId = item.fromLocationId || challan.fromLocationId;

      // Find the inventory item to get inventoryItemId
      const inventoryItem = await this.prisma.inventoryItem.findFirst({
        where: { tenantId, productId: item.productId },
      });

      if (inventoryItem) {
        await this.prisma.stockTransaction.create({
          data: {
            tenantId,
            inventoryItemId: inventoryItem.id,
            productId: item.productId,
            transactionType: 'SALE_OUT',
            quantity: -Number(item.quantity),
            locationId,
            referenceType: 'DELIVERY_CHALLAN',
            referenceId: challan.id,
            transactionDate: new Date(),
            createdById: userId,
          },
        });

        // Update inventory item stock
        await this.prisma.inventoryItem.updateMany({
          where: { tenantId, productId: item.productId },
          data: { currentStock: { decrement: Number(item.quantity) } },
        });

        // Update stock summary if exists
        await this.prisma.stockSummary.updateMany({
          where: { tenantId, productId: item.productId, locationId },
          data: {
            totalOut: { increment: Number(item.quantity) },
            currentStock: { decrement: Number(item.quantity) },
          },
        });
      }

      // If sale order linked, update SaleOrderItem.deliveredQty
      if (challan.saleOrderId && item.saleOrderItemId) {
        await this.prisma.saleOrderItem.update({
          where: { id: item.saleOrderItemId },
          data: {
            deliveredQty: { increment: Number(item.quantity) },
            pendingQty: { decrement: Number(item.quantity) },
          },
        });
      }
    }

    // Update challan status
    const updated = await this.prisma.deliveryChallan.update({
      where: { id },
      data: {
        status: 'DISPATCHED',
        dispatchDate: new Date(),
        inventoryUpdated: true,
      },
      include: { items: true },
    });

    // Update sale order delivery progress if linked
    if (challan.saleOrderId) {
      await this.saleOrderService.updateDeliveryProgress(tenantId, challan.saleOrderId);
    }

    return updated;
  }

  async deliver(tenantId: string, id: string) {
    const challan = await this.prisma.deliveryChallan.findFirst({ where: { id, tenantId } });
    if (!challan) throw new NotFoundException('Delivery challan not found');
    if (challan.status !== 'DISPATCHED') throw new BadRequestException('Only DISPATCHED challans can be marked as delivered');

    return this.prisma.deliveryChallan.update({
      where: { id },
      data: { status: 'DELIVERED', deliveryDate: new Date() },
    });
  }

  async cancel(tenantId: string, id: string) {
    const challan = await this.prisma.deliveryChallan.findFirst({ where: { id, tenantId } });
    if (!challan) throw new NotFoundException('Delivery challan not found');
    if (['DISPATCHED', 'DELIVERED', 'CANCELLED'].includes(challan.status)) {
      throw new BadRequestException('Cannot cancel dispatched/delivered/cancelled challans');
    }

    return this.prisma.deliveryChallan.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
