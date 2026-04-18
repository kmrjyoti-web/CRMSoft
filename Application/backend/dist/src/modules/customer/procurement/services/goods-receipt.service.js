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
exports.GoodsReceiptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const transaction_service_1 = require("../../../customer/inventory/services/transaction.service");
let GoodsReceiptService = class GoodsReceiptService {
    constructor(prisma, transactionService) {
        this.prisma = prisma;
        this.transactionService = transactionService;
    }
    async list(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const where = { tenantId };
        if (filters?.purchaseOrderId)
            where.poId = filters.purchaseOrderId;
        if (filters?.status)
            where.status = filters.status;
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
    async getById(tenantId, id) {
        const grn = await this.prisma.working.goodsReceipt.findFirst({
            where: { id, tenantId },
            include: {
                po: { select: { id: true, poNumber: true, vendorId: true } },
                items: true,
            },
        });
        if (!grn)
            throw new common_1.NotFoundException('Goods receipt not found');
        return grn;
    }
    async create(tenantId, userId, dto) {
        const po = await this.prisma.working.purchaseOrder.findFirst({
            where: { id: dto.purchaseOrderId, tenantId },
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        if (!['APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status)) {
            throw new common_1.BadRequestException('PO must be approved before receiving goods');
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
    async accept(tenantId, id, userId) {
        const grn = await this.prisma.working.goodsReceipt.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!grn)
            throw new common_1.NotFoundException('Goods receipt not found');
        if (!['DRAFT', 'INSPECTED'].includes(grn.status)) {
            throw new common_1.BadRequestException('GRN cannot be accepted in current status');
        }
        await this.prisma.working.goodsReceipt.update({
            where: { id },
            data: { status: 'ACCEPTED', inspectedById: userId, inventoryUpdated: true },
        });
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
            const rejectedQty = item.rejectedQty?.toNumber() ?? 0;
            if (rejectedQty > 0 && item.locationId) {
                const location = await this.prisma.working.stockLocation.findFirst({
                    where: { id: item.locationId, tenantId },
                });
                if (location) {
                    const scrapStore = await this.prisma.working.stockLocation.findFirst({
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
            if (item.poItemId) {
                await this.prisma.working.purchaseOrderItem.update({
                    where: { id: item.poItemId },
                    data: { receivedQty: { increment: acceptedQty } },
                });
            }
        }
        if (grn.poId) {
            const poItems = await this.prisma.working.purchaseOrderItem.findMany({
                where: { poId: grn.poId },
            });
            const allReceived = poItems.every((pi) => pi.receivedQty.toNumber() >= pi.orderedQty.toNumber());
            await this.prisma.working.purchaseOrder.update({
                where: { id: grn.poId },
                data: { status: allReceived ? 'COMPLETED' : 'PARTIALLY_RECEIVED' },
            });
        }
        return this.getById(tenantId, id);
    }
    async reject(tenantId, id, userId, remarks) {
        const grn = await this.prisma.working.goodsReceipt.findFirst({ where: { id, tenantId } });
        if (!grn)
            throw new common_1.NotFoundException('Goods receipt not found');
        return this.prisma.working.goodsReceipt.update({
            where: { id },
            data: {
                status: 'REJECTED',
                inspectedById: userId,
                remarks: remarks ? `${grn.remarks ?? ''}\nRejected: ${remarks}` : grn.remarks,
            },
        });
    }
    async generateNumber(tenantId) {
        const count = await this.prisma.working.goodsReceipt.count({ where: { tenantId } });
        return `GRN-${String(count + 1).padStart(5, '0')}`;
    }
};
exports.GoodsReceiptService = GoodsReceiptService;
exports.GoodsReceiptService = GoodsReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_service_1.TransactionService])
], GoodsReceiptService);
//# sourceMappingURL=goods-receipt.service.js.map