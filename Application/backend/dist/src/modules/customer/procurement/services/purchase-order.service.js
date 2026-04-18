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
exports.PurchaseOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let PurchaseOrderService = class PurchaseOrderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const where = { tenantId };
        if (filters?.vendorId)
            where.vendorId = filters.vendorId;
        if (filters?.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            this.prisma.working.purchaseOrder.findMany({
                where,
                include: {
                    items: true,
                    _count: { select: { goodsReceipts: true, purchaseInvoices: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.purchaseOrder.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getById(tenantId, id) {
        const po = await this.prisma.working.purchaseOrder.findFirst({
            where: { id, tenantId },
            include: {
                items: true,
                goodsReceipts: { select: { id: true, receiptNumber: true, status: true, createdAt: true } },
                purchaseInvoices: { select: { id: true, ourReference: true, status: true, grandTotal: true } },
            },
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        return po;
    }
    async create(tenantId, userId, dto) {
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
                tenantId,
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
        return this.prisma.working.purchaseOrder.create({
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
    async update(tenantId, id, dto) {
        const po = await this.prisma.working.purchaseOrder.findFirst({ where: { id, tenantId } });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        const data = {};
        if (dto.expectedDate !== undefined)
            data.expectedDeliveryDate = dto.expectedDate ? new Date(dto.expectedDate) : null;
        if (dto.notes !== undefined)
            data.remarks = dto.notes;
        if (dto.status !== undefined)
            data.status = dto.status;
        return this.prisma.working.purchaseOrder.update({ where: { id }, data });
    }
    async submitForApproval(tenantId, id) {
        const po = await this.prisma.working.purchaseOrder.findFirst({ where: { id, tenantId } });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        if (po.status !== 'DRAFT')
            throw new common_1.BadRequestException('Only draft POs can be submitted');
        return this.prisma.working.purchaseOrder.update({
            where: { id },
            data: { status: 'PENDING_APPROVAL' },
        });
    }
    async approve(tenantId, id, userId) {
        const po = await this.prisma.working.purchaseOrder.findFirst({ where: { id, tenantId } });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        if (po.status !== 'PENDING_APPROVAL')
            throw new common_1.BadRequestException('PO not pending approval');
        return this.prisma.working.purchaseOrder.update({
            where: { id },
            data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
        });
    }
    async reject(tenantId, id, userId, remarks) {
        const po = await this.prisma.working.purchaseOrder.findFirst({ where: { id, tenantId } });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        return this.prisma.working.purchaseOrder.update({
            where: { id },
            data: { status: 'REJECTED', remarks: remarks ? `${po.remarks ?? ''}\nRejected: ${remarks}` : po.remarks },
        });
    }
    async cancel(tenantId, id) {
        const po = await this.prisma.working.purchaseOrder.findFirst({ where: { id, tenantId } });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        if (['COMPLETED', 'CANCELLED'].includes(po.status)) {
            throw new common_1.BadRequestException('Cannot cancel completed/cancelled PO');
        }
        return this.prisma.working.purchaseOrder.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }
    async generateNumber(tenantId) {
        const count = await this.prisma.working.purchaseOrder.count({ where: { tenantId } });
        return `PO-${String(count + 1).padStart(5, '0')}`;
    }
};
exports.PurchaseOrderService = PurchaseOrderService;
exports.PurchaseOrderService = PurchaseOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrderService);
//# sourceMappingURL=purchase-order.service.js.map