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
exports.PaymentRecordService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let PaymentRecordService = class PaymentRecordService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, userId, data) {
        const number = await this.generateNumber(tenantId, data.paymentType);
        let tdsAmount;
        if (data.tdsApplicable && data.tdsRate) {
            tdsAmount = Math.round(data.amount * data.tdsRate / 100 * 100) / 100;
        }
        const payment = await this.prisma.working.paymentRecord.create({
            data: {
                tenantId,
                paymentNumber: number,
                paymentType: data.paymentType,
                entityType: data.entityType,
                entityId: data.entityId,
                entityName: data.entityName,
                referenceType: data.referenceType,
                referenceId: data.referenceId,
                amount: data.amount,
                paymentMode: data.paymentMode,
                bankAccountId: data.bankAccountId,
                chequeNumber: data.chequeNumber,
                chequeDate: data.chequeDate ? new Date(data.chequeDate) : undefined,
                transactionRef: data.transactionRef,
                upiId: data.upiId,
                tdsApplicable: data.tdsApplicable ?? false,
                tdsRate: data.tdsRate,
                tdsAmount,
                tdsSection: data.tdsSection,
                paymentDate: new Date(data.paymentDate),
                status: 'DRAFT',
                narration: data.narration,
                createdById: userId,
            },
        });
        return payment;
    }
    async approve(tenantId, userId, id) {
        const payment = await this.prisma.working.paymentRecord.findFirst({ where: { id, tenantId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        if (payment.status !== 'DRAFT' && payment.status !== 'PENDING_APPROVAL') {
            throw new common_1.BadRequestException(`Cannot approve payment in ${payment.status} status`);
        }
        const isPaymentOut = payment.paymentType === 'PAYMENT_OUT';
        const debitLedger = await this.getLedger(tenantId, isPaymentOut ? 'ACCOUNTS_PAYABLE' : payment.paymentMode === 'CASH' ? 'CASH' : 'BANK');
        const creditLedger = await this.getLedger(tenantId, isPaymentOut ? (payment.paymentMode === 'CASH' ? 'CASH' : 'BANK') : 'ACCOUNTS_RECEIVABLE');
        let accountTxnId;
        if (debitLedger && creditLedger) {
            const txn = await this.prisma.working.accountTransaction.create({
                data: {
                    tenantId,
                    transactionDate: payment.paymentDate,
                    voucherType: isPaymentOut ? 'PAYMENT' : 'RECEIPT',
                    voucherNumber: payment.paymentNumber,
                    referenceType: 'PAYMENT_RECORD',
                    referenceId: payment.id,
                    debitLedgerId: debitLedger.id,
                    creditLedgerId: creditLedger.id,
                    amount: Number(payment.amount),
                    narration: payment.narration || `${isPaymentOut ? 'Payment to' : 'Receipt from'} ${payment.entityName || payment.entityId}`,
                    createdById: userId,
                },
            });
            accountTxnId = txn.id;
            await this.prisma.working.ledgerMaster.update({
                where: { id: debitLedger.id },
                data: { currentBalance: { increment: Number(payment.amount) } },
            });
            await this.prisma.working.ledgerMaster.update({
                where: { id: creditLedger.id },
                data: { currentBalance: { decrement: Number(payment.amount) } },
            });
        }
        if (payment.bankAccountId) {
            const balanceChange = isPaymentOut ? -Number(payment.amount) : Number(payment.amount);
            await this.prisma.working.bankAccount.update({
                where: { id: payment.bankAccountId },
                data: { currentBalance: { increment: balanceChange } },
            });
        }
        if (payment.tdsApplicable && payment.tdsAmount) {
            await this.prisma.working.tDSRecord.create({
                data: {
                    tenantId,
                    section: payment.tdsSection || '194C',
                    sectionName: this.getTDSSectionName(payment.tdsSection || '194C'),
                    deducteeId: payment.entityId,
                    deducteeName: payment.entityName || '',
                    paymentRecordId: payment.id,
                    grossAmount: Number(payment.amount),
                    tdsRate: Number(payment.tdsRate),
                    tdsAmount: Number(payment.tdsAmount),
                    netAmount: Number(payment.amount) - Number(payment.tdsAmount),
                    deductionDate: payment.paymentDate,
                    status: 'DEDUCTED',
                    quarter: this.getQuarter(payment.paymentDate),
                    financialYear: this.getFY(payment.paymentDate),
                },
            });
        }
        return this.prisma.working.paymentRecord.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedById: userId,
                accountTransactionId: accountTxnId,
            },
        });
    }
    async cancel(tenantId, id) {
        const payment = await this.prisma.working.paymentRecord.findFirst({ where: { id, tenantId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        if (payment.status === 'RECONCILED')
            throw new common_1.BadRequestException('Cannot cancel reconciled payment');
        return this.prisma.working.paymentRecord.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.paymentType)
            where.paymentType = filters.paymentType;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.entityId)
            where.entityId = filters.entityId;
        if (filters?.paymentMode)
            where.paymentMode = filters.paymentMode;
        if (filters?.startDate || filters?.endDate) {
            where.paymentDate = {};
            if (filters?.startDate)
                where.paymentDate.gte = new Date(filters.startDate);
            if (filters?.endDate)
                where.paymentDate.lte = new Date(filters.endDate);
        }
        return this.prisma.working.paymentRecord.findMany({
            where,
            orderBy: { paymentDate: 'desc' },
        });
    }
    async findById(tenantId, id) {
        const payment = await this.prisma.working.paymentRecord.findFirst({ where: { id, tenantId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return payment;
    }
    async getPending(tenantId) {
        return this.prisma.working.paymentRecord.findMany({
            where: { tenantId, status: { in: ['DRAFT', 'PENDING_APPROVAL'] } },
            orderBy: { paymentDate: 'asc' },
        });
    }
    async getOverdue(tenantId) {
        return this.prisma.working.purchaseInvoice.findMany({
            where: {
                tenantId,
                paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                dueDate: { lt: new Date() },
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getLedger(tenantId, code) {
        return this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, code } });
    }
    async generateNumber(tenantId, type) {
        const prefix = type === 'PAYMENT_OUT' ? 'PAY' : 'REC';
        const year = new Date().getFullYear();
        const count = await this.prisma.working.paymentRecord.count({
            where: { tenantId, paymentType: type },
        });
        return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    getTDSSectionName(section) {
        const names = {
            '194C': 'Payment to Contractors',
            '194J': 'Professional/Technical Fees',
            '194H': 'Commission/Brokerage',
            '194I': 'Rent',
            '194A': 'Interest',
        };
        return names[section] || section;
    }
    getQuarter(date) {
        const month = date.getMonth();
        if (month >= 3 && month <= 5)
            return 'Q1';
        if (month >= 6 && month <= 8)
            return 'Q2';
        if (month >= 9 && month <= 11)
            return 'Q3';
        return 'Q4';
    }
    getFY(date) {
        const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
        return `${year}-${(year + 1).toString().slice(2)}`;
    }
};
exports.PaymentRecordService = PaymentRecordService;
exports.PaymentRecordService = PaymentRecordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentRecordService);
//# sourceMappingURL=payment-record.service.js.map