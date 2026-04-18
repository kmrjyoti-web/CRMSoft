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
var CreditNoteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditNoteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const auto_number_service_1 = require("../../../core/identity/settings/services/auto-number.service");
const cross_service_decorator_1 = require("../../../../common/decorators/cross-service.decorator");
const invoice_service_1 = require("./invoice.service");
let CreditNoteService = CreditNoteService_1 = class CreditNoteService {
    constructor(prisma, autoNumber, invoiceService) {
        this.prisma = prisma;
        this.autoNumber = autoNumber;
        this.invoiceService = invoiceService;
        this.logger = new common_1.Logger(CreditNoteService_1.name);
    }
    async create(tenantId, dto, userId) {
        const invoice = await this.prisma.working.invoice.findFirst({
            where: { id: dto.invoiceId, tenantId },
        });
        if (!invoice)
            throw app_error_1.AppError.from('INVOICE_NOT_FOUND');
        if (dto.amount > Number(invoice.totalAmount)) {
            throw app_error_1.AppError.from('CREDIT_NOTE_EXCEEDS_INVOICE');
        }
        const creditNoteNo = await this.autoNumber.next(tenantId, 'CreditNote');
        const creditNote = await this.prisma.working.creditNote.create({
            data: {
                tenantId,
                creditNoteNo,
                invoiceId: dto.invoiceId,
                amount: dto.amount,
                reason: dto.reason,
                status: 'CN_DRAFT',
                createdById: userId,
            },
        });
        this.logger.log(`Credit note ${creditNoteNo} created for invoice ${invoice.invoiceNo}`);
        return creditNote;
    }
    async issue(tenantId, creditNoteId, userId) {
        const cn = await this.prisma.working.creditNote.findFirst({
            where: { id: creditNoteId, tenantId },
        });
        if (!cn)
            throw app_error_1.AppError.from('CREDIT_NOTE_NOT_FOUND');
        return this.prisma.working.creditNote.update({
            where: { id: creditNoteId },
            data: {
                status: 'CN_ISSUED',
                issuedAt: new Date(),
                issuedById: userId,
            },
        });
    }
    async apply(tenantId, creditNoteId, dto) {
        const cn = await this.prisma.working.creditNote.findFirst({
            where: { id: creditNoteId, tenantId },
        });
        if (!cn)
            throw app_error_1.AppError.from('CREDIT_NOTE_NOT_FOUND');
        if (cn.status === 'CN_APPLIED')
            throw app_error_1.AppError.from('CREDIT_NOTE_ALREADY_APPLIED');
        const targetInvoice = await this.prisma.working.invoice.findFirst({
            where: { id: dto.applyToInvoiceId, tenantId },
        });
        if (!targetInvoice)
            throw app_error_1.AppError.from('INVOICE_NOT_FOUND');
        const applyAmount = dto.amount || Number(cn.amount);
        if (applyAmount > Number(targetInvoice.balanceAmount)) {
            throw app_error_1.AppError.from('CREDIT_NOTE_EXCEEDS_INVOICE');
        }
        const updated = await this.prisma.working.creditNote.update({
            where: { id: creditNoteId },
            data: {
                status: 'CN_APPLIED',
                appliedToInvoiceId: dto.applyToInvoiceId,
                appliedAmount: applyAmount,
                appliedAt: new Date(),
            },
        });
        await this.invoiceService.recalculateBalance(dto.applyToInvoiceId);
        this.logger.log(`Credit note ${cn.creditNoteNo} applied to invoice`);
        return updated;
    }
    async cancel(tenantId, creditNoteId) {
        const cn = await this.prisma.working.creditNote.findFirst({
            where: { id: creditNoteId, tenantId },
        });
        if (!cn)
            throw app_error_1.AppError.from('CREDIT_NOTE_NOT_FOUND');
        if (cn.status === 'CN_APPLIED')
            throw app_error_1.AppError.from('CREDIT_NOTE_ALREADY_APPLIED');
        return this.prisma.working.creditNote.update({
            where: { id: creditNoteId },
            data: { status: 'CN_CANCELLED' },
        });
    }
    async getById(tenantId, creditNoteId) {
        const cn = await this.prisma.working.creditNote.findFirst({
            where: { id: creditNoteId, tenantId },
            include: { invoice: true },
        });
        if (!cn)
            throw app_error_1.AppError.from('CREDIT_NOTE_NOT_FOUND');
        return cn;
    }
    async list(tenantId, query) {
        const where = { tenantId };
        if (query.invoiceId)
            where.invoiceId = query.invoiceId;
        if (query.status)
            where.status = query.status;
        if (query.fromDate || query.toDate) {
            where.createdAt = {};
            if (query.fromDate)
                where.createdAt.gte = new Date(query.fromDate);
            if (query.toDate)
                where.createdAt.lte = new Date(query.toDate);
        }
        const page = query.page || 1;
        const limit = query.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.creditNote.findMany({
                where,
                include: { invoice: { select: { invoiceNo: true, billingName: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.creditNote.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.CreditNoteService = CreditNoteService;
exports.CreditNoteService = CreditNoteService = CreditNoteService_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses AutoNumberService from identity settings to generate credit note numbers'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auto_number_service_1.AutoNumberService,
        invoice_service_1.InvoiceService])
], CreditNoteService);
//# sourceMappingURL=credit-note.service.js.map