"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryChallanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const sale_order_service_1 = require("./sale-order.service");
let DeliveryChallanService = class DeliveryChallanService {
    constructor(prisma, saleOrderService) {
        this.prisma = prisma;
        this.saleOrderService = saleOrderService;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.deliveryChallan.count({
            where: { tenantId, challanNumber: { startsWith: `DC-${year}-` } },
        });
        return `DC-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async create(tenantId, userId, dto) {
        const challanNumber = await this.generateNumber(tenantId);
        if (dto.saleOrderId) {
            const saleOrder = await this.prisma.working.saleOrder.findFirst({
                where: { id: dto.saleOrderId, tenantId },
                include: { items: true },
            });
            if (!saleOrder)
                throw new common_1.NotFoundException('Sale order not found');
            if (!['CONFIRMED', 'PARTIALLY_DELIVERED'].includes(saleOrder.status)) {
                throw new common_1.BadRequestException('Sale order must be CONFIRMED or PARTIALLY_DELIVERED for delivery');
            }
            for (const dcItem of dto.items) {
                if (dcItem.saleOrderItemId) {
                    const soItem = saleOrder.items.find((si) => si.id === dcItem.saleOrderItemId);
                    if (!soItem)
                        throw new common_1.BadRequestException(`Sale order item ${dcItem.saleOrderItemId} not found`);
                    if (dcItem.quantity > Number(soItem.pendingQty)) {
                        throw new common_1.BadRequestException(`Delivery quantity (${dcItem.quantity}) exceeds pending quantity (${soItem.pendingQty}) for product ${dcItem.productId}`);
                    }
                }
            }
        }
        let totalAmount = 0;
        for (const item of dto.items) {
            if (item.unitPrice) {
                totalAmount += item.quantity * item.unitPrice;
            }
        }
        return this.prisma.working.deliveryChallan.create({
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
    async findAll(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const where = { tenantId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.customerId)
            where.customerId = filters.customerId;
        if (filters?.saleOrderId)
            where.saleOrderId = filters.saleOrderId;
        const [data, total] = await Promise.all([
            this.prisma.working.deliveryChallan.findMany({
                where,
                include: { items: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.deliveryChallan.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findById(tenantId, id) {
        const challan = await this.prisma.working.deliveryChallan.findFirst({
            where: { id, tenantId },
            include: { items: true, saleOrder: { select: { id: true, orderNumber: true, status: true } } },
        });
        if (!challan)
            throw new common_1.NotFoundException('Delivery challan not found');
        return challan;
    }
    async dispatch(tenantId, id, userId) {
        const challan = await this.prisma.working.deliveryChallan.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!challan)
            throw new common_1.NotFoundException('Delivery challan not found');
        if (challan.status !== 'DRAFT')
            throw new common_1.BadRequestException('Only DRAFT challans can be dispatched');
        for (const item of challan.items) {
            const locationId = item.fromLocationId || challan.fromLocationId;
            const inventoryItem = await this.prisma.working.inventoryItem.findFirst({
                where: { tenantId, productId: item.productId },
            });
            if (inventoryItem) {
                await this.prisma.working.stockTransaction.create({
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
                await this.prisma.working.inventoryItem.updateMany({
                    where: { tenantId, productId: item.productId },
                    data: { currentStock: { decrement: Number(item.quantity) } },
                });
                await this.prisma.working.stockSummary.updateMany({
                    where: { tenantId, productId: item.productId, locationId },
                    data: {
                        totalOut: { increment: Number(item.quantity) },
                        currentStock: { decrement: Number(item.quantity) },
                    },
                });
            }
            if (challan.saleOrderId && item.saleOrderItemId) {
                await this.prisma.working.saleOrderItem.update({
                    where: { id: item.saleOrderItemId },
                    data: {
                        deliveredQty: { increment: Number(item.quantity) },
                        pendingQty: { decrement: Number(item.quantity) },
                    },
                });
            }
        }
        const updated = await this.prisma.working.deliveryChallan.update({
            where: { id },
            data: {
                status: 'DISPATCHED',
                dispatchDate: new Date(),
                inventoryUpdated: true,
            },
            include: { items: true },
        });
        if (challan.saleOrderId) {
            await this.saleOrderService.updateDeliveryProgress(tenantId, challan.saleOrderId);
        }
        return updated;
    }
    async deliver(tenantId, id) {
        const challan = await this.prisma.working.deliveryChallan.findFirst({ where: { id, tenantId } });
        if (!challan)
            throw new common_1.NotFoundException('Delivery challan not found');
        if (challan.status !== 'DISPATCHED')
            throw new common_1.BadRequestException('Only DISPATCHED challans can be marked as delivered');
        return this.prisma.working.deliveryChallan.update({
            where: { id },
            data: { status: 'DELIVERED', deliveryDate: new Date() },
        });
    }
    async cancel(tenantId, id) {
        const challan = await this.prisma.working.deliveryChallan.findFirst({ where: { id, tenantId } });
        if (!challan)
            throw new common_1.NotFoundException('Delivery challan not found');
        if (['DISPATCHED', 'DELIVERED', 'CANCELLED'].includes(challan.status)) {
            throw new common_1.BadRequestException('Cannot cancel dispatched/delivered/cancelled challans');
        }
        return this.prisma.working.deliveryChallan.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }
};
exports.DeliveryChallanService = DeliveryChallanService;
exports.DeliveryChallanService = DeliveryChallanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sale_order_service_1.SaleOrderService])
], DeliveryChallanService);
//# sourceMappingURL=delivery-challan.service.js.map