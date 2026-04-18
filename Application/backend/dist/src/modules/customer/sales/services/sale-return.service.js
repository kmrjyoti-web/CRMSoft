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
exports.SaleReturnService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const credit_note_enhanced_service_1 = require("./credit-note-enhanced.service");
let SaleReturnService = class SaleReturnService {
    constructor(prisma, creditNoteService) {
        this.prisma = prisma;
        this.creditNoteService = creditNoteService;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.saleReturn.count({
            where: { tenantId, returnNumber: { startsWith: `SR-${year}-` } },
        });
        return `SR-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    calculateItemTotal(item) {
        const lineTotal = item.returnedQty * item.unitPrice;
        const taxAmount = lineTotal * ((item.taxRate ?? 0) / 100);
        const totalAmount = lineTotal + taxAmount;
        return { lineTotal, taxAmount, totalAmount };
    }
    async create(tenantId, userId, dto) {
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
        return this.prisma.working.saleReturn.create({
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
    async findAll(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const where = { tenantId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.customerId)
            where.customerId = filters.customerId;
        const [data, total] = await Promise.all([
            this.prisma.working.saleReturn.findMany({
                where,
                include: { items: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.saleReturn.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findById(tenantId, id) {
        const saleReturn = await this.prisma.working.saleReturn.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!saleReturn)
            throw new common_1.NotFoundException('Sale return not found');
        return saleReturn;
    }
    async inspect(tenantId, id, dto) {
        const saleReturn = await this.prisma.working.saleReturn.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!saleReturn)
            throw new common_1.NotFoundException('Sale return not found');
        if (saleReturn.status !== 'DRAFT')
            throw new common_1.BadRequestException('Only DRAFT returns can be inspected');
        for (const inspection of dto.inspections) {
            const item = saleReturn.items.find((i) => i.id === inspection.itemId);
            if (!item)
                throw new common_1.BadRequestException(`Return item ${inspection.itemId} not found`);
            await this.prisma.working.saleReturnItem.update({
                where: { id: inspection.itemId },
                data: {
                    acceptedQty: inspection.acceptedQty,
                    rejectedQty: inspection.rejectedQty,
                    condition: inspection.condition ?? item.condition,
                },
            });
        }
        return this.prisma.working.saleReturn.update({
            where: { id },
            data: { status: 'INSPECTED' },
            include: { items: true },
        });
    }
    async accept(tenantId, id, userId) {
        const saleReturn = await this.prisma.working.saleReturn.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!saleReturn)
            throw new common_1.NotFoundException('Sale return not found');
        if (!['DRAFT', 'INSPECTED'].includes(saleReturn.status)) {
            throw new common_1.BadRequestException('Only DRAFT or INSPECTED returns can be accepted');
        }
        for (const item of saleReturn.items) {
            const acceptedQty = item.acceptedQty ? Number(item.acceptedQty) : Number(item.returnedQty);
            if (acceptedQty <= 0)
                continue;
            const locationId = saleReturn.receiveLocationId;
            const inventoryItem = await this.prisma.working.inventoryItem.findFirst({
                where: { tenantId, productId: item.productId },
            });
            if (inventoryItem && locationId) {
                await this.prisma.working.stockTransaction.create({
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
                await this.prisma.working.inventoryItem.updateMany({
                    where: { tenantId, productId: item.productId },
                    data: { currentStock: { increment: acceptedQty } },
                });
                await this.prisma.working.stockSummary.updateMany({
                    where: { tenantId, productId: item.productId, locationId },
                    data: {
                        totalIn: { increment: acceptedQty },
                        currentStock: { increment: acceptedQty },
                    },
                });
            }
            if (saleReturn.saleOrderId) {
                const soItem = await this.prisma.working.saleOrderItem.findFirst({
                    where: { saleOrder: { id: saleReturn.saleOrderId }, productId: item.productId },
                });
                if (soItem) {
                    await this.prisma.working.saleOrderItem.update({
                        where: { id: soItem.id },
                        data: { returnedQty: { increment: acceptedQty } },
                    });
                }
            }
        }
        const updated = await this.prisma.working.saleReturn.update({
            where: { id },
            data: { status: 'ACCEPTED', inventoryUpdated: true },
            include: { items: true },
        });
        try {
            const creditNote = await this.creditNoteService.createFromReturn(tenantId, userId, updated);
            if (creditNote) {
                await this.prisma.working.saleReturn.update({
                    where: { id },
                    data: { creditNoteId: creditNote.id },
                });
            }
        }
        catch {
        }
        return updated;
    }
    async reject(tenantId, id) {
        const saleReturn = await this.prisma.working.saleReturn.findFirst({ where: { id, tenantId } });
        if (!saleReturn)
            throw new common_1.NotFoundException('Sale return not found');
        return this.prisma.working.saleReturn.update({
            where: { id },
            data: { status: 'REJECTED' },
        });
    }
};
exports.SaleReturnService = SaleReturnService;
exports.SaleReturnService = SaleReturnService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credit_note_enhanced_service_1.CreditNoteEnhancedService])
], SaleReturnService);
//# sourceMappingURL=sale-return.service.js.map