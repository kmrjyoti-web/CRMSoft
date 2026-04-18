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
exports.PurchaseQuotationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let PurchaseQuotationService = class PurchaseQuotationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const where = { tenantId };
        if (filters?.rfqId)
            where.rfqId = filters.rfqId;
        if (filters?.vendorId)
            where.vendorId = filters.vendorId;
        if (filters?.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            this.prisma.working.purchaseQuotation.findMany({
                where,
                include: {
                    rfq: { select: { id: true, rfqNumber: true } },
                    items: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.purchaseQuotation.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getById(tenantId, id) {
        const quotation = await this.prisma.working.purchaseQuotation.findFirst({
            where: { id, tenantId },
            include: {
                rfq: { select: { id: true, rfqNumber: true } },
                items: true,
            },
        });
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        return quotation;
    }
    async create(tenantId, userId, dto) {
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
                unitId: item.unitId ?? '',
                unitPrice: item.unitPrice,
                discount: item.discount ?? 0,
                taxRate: item.taxRate ?? 0,
                taxAmount: tax,
                totalAmount: total,
            };
        });
        return this.prisma.working.purchaseQuotation.create({
            data: {
                tenantId,
                rfqId: dto.rfqId,
                vendorId: dto.vendorId,
                quotationNumber: dto.quotationNumber,
                quotationDate: new Date(),
                validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
                creditDays: dto.paymentTermDays,
                subtotal,
                taxAmount: taxTotal,
                grandTotal: subtotal + taxTotal,
                status: 'RECEIVED',
                remarks: dto.notes,
                items: { create: itemsData },
            },
            include: { items: true },
        });
    }
    async updateStatus(tenantId, id, status) {
        const quotation = await this.prisma.working.purchaseQuotation.findFirst({ where: { id, tenantId } });
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        return this.prisma.working.purchaseQuotation.update({ where: { id }, data: { status } });
    }
    async generateNumber(tenantId) {
        const count = await this.prisma.working.purchaseQuotation.count({ where: { tenantId } });
        return `PQ-${String(count + 1).padStart(5, '0')}`;
    }
};
exports.PurchaseQuotationService = PurchaseQuotationService;
exports.PurchaseQuotationService = PurchaseQuotationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseQuotationService);
//# sourceMappingURL=purchase-quotation.service.js.map