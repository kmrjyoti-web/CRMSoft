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
exports.ReceiptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const auto_number_service_1 = require("../../../core/identity/settings/services/auto-number.service");
const cross_service_decorator_1 = require("../../../../common/decorators/cross-service.decorator");
const amount_in_words_service_1 = require("./amount-in-words.service");
let ReceiptService = class ReceiptService {
    constructor(prisma, autoNumber, amountInWords) {
        this.prisma = prisma;
        this.autoNumber = autoNumber;
        this.amountInWords = amountInWords;
    }
    async generateForPayment(tenantId, paymentId, userId) {
        const payment = await this.prisma.working.payment.findFirst({
            where: { id: paymentId, tenantId },
            include: { invoice: true, receipt: true },
        });
        if (!payment)
            throw app_error_1.AppError.from('PAYMENT_NOT_FOUND');
        if (payment.receipt)
            return payment.receipt;
        const receiptNo = await this.autoNumber.next(tenantId, 'Receipt');
        const words = this.amountInWords.convert(Number(payment.amount));
        const receipt = await this.prisma.working.paymentReceipt.create({
            data: {
                tenantId,
                receiptNo,
                paymentId: payment.id,
                amount: Number(payment.amount),
                amountInWords: words,
                receivedFrom: payment.invoice.billingName,
                paidFor: `Invoice ${payment.invoice.invoiceNo}`,
                paymentMethod: payment.method,
                paymentDate: payment.paidAt || new Date(),
                notes: payment.notes,
                generatedById: userId,
            },
        });
        return receipt;
    }
    async getById(tenantId, receiptId) {
        const receipt = await this.prisma.working.paymentReceipt.findFirst({
            where: { id: receiptId, tenantId },
            include: { payment: { include: { invoice: true } } },
        });
        if (!receipt)
            throw app_error_1.AppError.from('RECEIPT_NOT_FOUND');
        return receipt;
    }
    async getByPaymentId(tenantId, paymentId) {
        const receipt = await this.prisma.working.paymentReceipt.findFirst({
            where: { paymentId, tenantId },
            include: { payment: { include: { invoice: true } } },
        });
        if (!receipt)
            throw app_error_1.AppError.from('RECEIPT_NOT_FOUND');
        return receipt;
    }
    async list(tenantId, page = 1, limit = 20) {
        const [data, total] = await Promise.all([
            this.prisma.working.paymentReceipt.findMany({
                where: { tenantId },
                include: { payment: { select: { paymentNo: true, invoice: { select: { invoiceNo: true } } } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.paymentReceipt.count({ where: { tenantId } }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.ReceiptService = ReceiptService;
exports.ReceiptService = ReceiptService = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses AutoNumberService from identity settings to generate receipt numbers'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auto_number_service_1.AutoNumberService,
        amount_in_words_service_1.AmountInWordsService])
], ReceiptService);
//# sourceMappingURL=receipt.service.js.map