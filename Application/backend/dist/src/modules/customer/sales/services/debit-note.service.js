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
exports.DebitNoteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let DebitNoteService = class DebitNoteService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.debitNote.count({
            where: { tenantId, debitNoteNumber: { startsWith: `DN-${year}-` } },
        });
        return `DN-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async create(tenantId, userId, dto) {
        const debitNoteNumber = await this.generateNumber(tenantId);
        let subtotal = 0;
        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;
        const itemsData = dto.items.map((item) => {
            subtotal += item.taxableAmount;
            cgstAmount += item.cgstAmount ?? 0;
            sgstAmount += item.sgstAmount ?? 0;
            igstAmount += item.igstAmount ?? 0;
            const totalAmount = item.taxableAmount + (item.cgstAmount ?? 0) + (item.sgstAmount ?? 0) + (item.igstAmount ?? 0);
            return {
                tenantId,
                productId: item.productId,
                quantity: item.quantity,
                unitId: item.unitId,
                unitPrice: item.unitPrice,
                taxableAmount: item.taxableAmount,
                cgstAmount: item.cgstAmount ?? 0,
                sgstAmount: item.sgstAmount ?? 0,
                igstAmount: item.igstAmount ?? 0,
                hsnCode: item.hsnCode,
                totalAmount,
            };
        });
        const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;
        return this.prisma.working.debitNote.create({
            data: {
                tenantId,
                debitNoteNumber,
                vendorId: dto.vendorId,
                purchaseInvoiceId: dto.purchaseInvoiceId,
                goodsReceiptId: dto.goodsReceiptId,
                reason: dto.reason,
                inventoryEffect: dto.inventoryEffect ?? true,
                accountsEffect: dto.accountsEffect ?? true,
                subtotal,
                cgstAmount,
                sgstAmount,
                igstAmount,
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
        if (filters?.vendorId)
            where.vendorId = filters.vendorId;
        const [data, total] = await Promise.all([
            this.prisma.working.debitNote.findMany({
                where,
                include: { items: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.debitNote.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findById(tenantId, id) {
        const note = await this.prisma.working.debitNote.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!note)
            throw new common_1.NotFoundException('Debit note not found');
        return note;
    }
    async issue(tenantId, id, userId) {
        const note = await this.prisma.working.debitNote.findFirst({
            where: { id, tenantId },
            include: { items: true },
        });
        if (!note)
            throw new common_1.NotFoundException('Debit note not found');
        if (note.status !== 'DRAFT')
            throw new common_1.BadRequestException('Only DRAFT debit notes can be issued');
        if (note.inventoryEffect) {
            for (const item of note.items) {
                const inventoryItem = await this.prisma.working.inventoryItem.findFirst({
                    where: { tenantId, productId: item.productId },
                });
                if (inventoryItem) {
                    const locationId = inventoryItem.defaultLocationId ?? 'DEFAULT';
                    await this.prisma.working.stockTransaction.create({
                        data: {
                            tenantId,
                            inventoryItemId: inventoryItem.id,
                            productId: item.productId,
                            transactionType: 'SALE_OUT',
                            quantity: -Number(item.quantity),
                            locationId,
                            referenceType: 'DEBIT_NOTE',
                            referenceId: note.id,
                            transactionDate: new Date(),
                            createdById: userId,
                        },
                    });
                    await this.prisma.working.inventoryItem.updateMany({
                        where: { tenantId, productId: item.productId },
                        data: { currentStock: { decrement: Number(item.quantity) } },
                    });
                }
            }
        }
        if (note.accountsEffect) {
            await this.prisma.working.accountTransaction.create({
                data: {
                    tenantId,
                    transactionDate: new Date(),
                    voucherType: 'DEBIT_NOTE',
                    voucherNumber: note.debitNoteNumber,
                    referenceType: 'DEBIT_NOTE',
                    referenceId: note.id,
                    debitLedgerId: 'VENDOR',
                    creditLedgerId: 'PURCHASE_RETURN',
                    amount: note.grandTotal,
                    narration: `Debit Note ${note.debitNoteNumber} - ${note.reason}`,
                    createdById: userId,
                },
            });
        }
        return this.prisma.working.debitNote.update({
            where: { id },
            data: {
                status: 'ISSUED',
                accountTransactionId: note.accountsEffect ? undefined : null,
            },
            include: { items: true },
        });
    }
    async adjust(tenantId, id, dto) {
        const note = await this.prisma.working.debitNote.findFirst({ where: { id, tenantId } });
        if (!note)
            throw new common_1.NotFoundException('Debit note not found');
        if (note.status !== 'ISSUED')
            throw new common_1.BadRequestException('Only ISSUED debit notes can be adjusted');
        if (!dto.invoiceId) {
            throw new common_1.BadRequestException('invoiceId is required to adjust debit note against purchase invoice');
        }
        const purchaseInvoice = await this.prisma.working.purchaseInvoice.findFirst({
            where: { id: dto.invoiceId, tenantId },
        });
        if (!purchaseInvoice)
            throw new common_1.NotFoundException('Purchase invoice not found');
        const currentBalance = Number(purchaseInvoice.balanceAmount ?? purchaseInvoice.grandTotal);
        const debitAmount = Number(note.grandTotal);
        const newBalance = Math.max(0, currentBalance - debitAmount);
        await this.prisma.working.purchaseInvoice.update({
            where: { id: dto.invoiceId },
            data: { balanceAmount: newBalance },
        });
        return this.prisma.working.debitNote.update({
            where: { id },
            data: { status: 'ADJUSTED', purchaseInvoiceId: dto.invoiceId },
        });
    }
};
exports.DebitNoteService = DebitNoteService;
exports.DebitNoteService = DebitNoteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DebitNoteService);
//# sourceMappingURL=debit-note.service.js.map