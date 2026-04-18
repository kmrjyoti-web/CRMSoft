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
exports.CreditNoteEnhancedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CreditNoteEnhancedService = class CreditNoteEnhancedService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.prisma.working.creditNote.count({
            where: { tenantId, creditNoteNo: { startsWith: `CN-${year}-` } },
        });
        return `CN-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async createFromReturn(tenantId, userId, saleReturn) {
        if (!saleReturn.invoiceId) {
            return null;
        }
        let totalAmount = 0;
        for (const item of saleReturn.items) {
            const acceptedQty = item.acceptedQty ? Number(item.acceptedQty) : Number(item.returnedQty);
            if (acceptedQty <= 0)
                continue;
            const itemTotal = acceptedQty * Number(item.unitPrice);
            const taxAmount = itemTotal * (Number(item.taxRate ?? 0) / 100);
            totalAmount += itemTotal + taxAmount;
        }
        if (totalAmount <= 0)
            return null;
        const creditNoteNo = await this.generateNumber(tenantId);
        return this.prisma.working.creditNote.create({
            data: {
                tenantId,
                creditNoteNo,
                invoiceId: saleReturn.invoiceId,
                amount: totalAmount,
                reason: `Sale Return: ${saleReturn.returnReason ?? saleReturn.returnNumber}`,
                status: 'CN_DRAFT',
                createdById: userId,
            },
        });
    }
    async createManual(tenantId, userId, dto) {
        if (!dto.invoiceId)
            throw new common_1.BadRequestException('invoiceId is required for credit note creation');
        const creditNoteNo = await this.generateNumber(tenantId);
        let totalAmount = 0;
        for (const item of dto.items) {
            const itemTotal = item.taxableAmount + (item.cgstAmount ?? 0) + (item.sgstAmount ?? 0) + (item.igstAmount ?? 0);
            totalAmount += itemTotal;
        }
        return this.prisma.working.creditNote.create({
            data: {
                tenantId,
                creditNoteNo,
                invoiceId: dto.invoiceId,
                amount: totalAmount,
                reason: dto.reason,
                status: 'CN_DRAFT',
                createdById: userId,
            },
        });
    }
    async findAll(tenantId, filters) {
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 20;
        const where = { tenantId };
        if (filters?.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            this.prisma.working.creditNote.findMany({
                where,
                include: { invoice: { select: { id: true, invoiceNo: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.creditNote.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findById(tenantId, id) {
        const note = await this.prisma.working.creditNote.findFirst({
            where: { id, tenantId },
            include: { invoice: true },
        });
        if (!note)
            throw new common_1.NotFoundException('Credit note not found');
        return note;
    }
    async issue(tenantId, id, userId) {
        const note = await this.prisma.working.creditNote.findFirst({ where: { id, tenantId } });
        if (!note)
            throw new common_1.NotFoundException('Credit note not found');
        if (note.status !== 'CN_DRAFT')
            throw new common_1.BadRequestException('Only DRAFT credit notes can be issued');
        await this.prisma.working.accountTransaction.create({
            data: {
                tenantId,
                transactionDate: new Date(),
                voucherType: 'CREDIT_NOTE',
                voucherNumber: note.creditNoteNo,
                referenceType: 'CREDIT_NOTE',
                referenceId: note.id,
                debitLedgerId: 'SALES_RETURN',
                creditLedgerId: 'CUSTOMER',
                amount: note.amount,
                narration: `Credit Note ${note.creditNoteNo} issued - ${note.reason}`,
                createdById: userId,
            },
        });
        return this.prisma.working.creditNote.update({
            where: { id },
            data: { status: 'CN_ISSUED', issuedAt: new Date(), issuedById: userId },
        });
    }
    async adjust(tenantId, id, dto) {
        const note = await this.prisma.working.creditNote.findFirst({ where: { id, tenantId } });
        if (!note)
            throw new common_1.NotFoundException('Credit note not found');
        if (note.status !== 'CN_ISSUED')
            throw new common_1.BadRequestException('Only ISSUED credit notes can be adjusted');
        if (dto.invoiceId) {
            const invoice = await this.prisma.working.invoice.findFirst({
                where: { id: dto.invoiceId, tenantId },
            });
            if (!invoice)
                throw new common_1.NotFoundException('Invoice not found');
            const currentBalance = Number(invoice.balanceAmount ?? invoice.totalAmount);
            const creditAmount = Number(note.amount);
            const newBalance = Math.max(0, currentBalance - creditAmount);
            await this.prisma.working.invoice.update({
                where: { id: dto.invoiceId },
                data: { balanceAmount: newBalance },
            });
            return this.prisma.working.creditNote.update({
                where: { id },
                data: {
                    status: 'CN_APPLIED',
                    appliedToInvoiceId: dto.invoiceId,
                    appliedAmount: note.amount,
                    appliedAt: new Date(),
                },
            });
        }
        if (dto.issueRefund) {
            return this.prisma.working.creditNote.update({
                where: { id },
                data: {
                    status: 'CN_APPLIED',
                    appliedAmount: note.amount,
                    appliedAt: new Date(),
                },
            });
        }
        throw new common_1.BadRequestException('Provide invoiceId to adjust or set issueRefund to true');
    }
};
exports.CreditNoteEnhancedService = CreditNoteEnhancedService;
exports.CreditNoteEnhancedService = CreditNoteEnhancedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreditNoteEnhancedService);
//# sourceMappingURL=credit-note-enhanced.service.js.map