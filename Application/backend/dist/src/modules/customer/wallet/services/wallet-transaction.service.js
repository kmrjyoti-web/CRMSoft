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
exports.WalletTransactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const wallet_service_1 = require("./wallet.service");
let WalletTransactionService = class WalletTransactionService {
    constructor(prisma, walletService) {
        this.prisma = prisma;
        this.walletService = walletService;
    }
    async debit(tenantId, params) {
        const wallet = await this.walletService.ensureSufficientBalance(tenantId, params.tokens);
        let promoDebit = 0;
        let mainDebit = 0;
        if (wallet.promoBalance >= params.tokens) {
            promoDebit = params.tokens;
        }
        else {
            promoDebit = wallet.promoBalance;
            mainDebit = params.tokens - promoDebit;
        }
        const balanceBefore = wallet.balance + wallet.promoBalance;
        const balanceAfter = balanceBefore - params.tokens;
        const [updatedWallet, transaction] = await this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: mainDebit },
                    promoBalance: { decrement: promoDebit },
                    lifetimeDebit: { increment: params.tokens },
                },
            }),
            this.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    tenantId,
                    type: 'DEBIT',
                    status: 'WTX_COMPLETED',
                    tokens: -params.tokens,
                    balanceBefore,
                    balanceAfter,
                    description: params.description,
                    serviceKey: params.serviceKey,
                    referenceType: params.referenceType,
                    referenceId: params.referenceId,
                    metadata: params.metadata,
                    createdById: params.createdById,
                },
            }),
        ]);
        return {
            transaction,
            newBalance: updatedWallet.balance + updatedWallet.promoBalance,
        };
    }
    async credit(tenantId, params) {
        const wallet = await this.walletService.getOrCreate(tenantId);
        const balanceBefore = wallet.balance + wallet.promoBalance;
        const balanceAfter = balanceBefore + params.tokens;
        const isPromo = params.type === 'PROMO';
        const [updatedWallet, transaction] = await this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { id: wallet.id },
                data: isPromo
                    ? { promoBalance: { increment: params.tokens }, lifetimeCredit: { increment: params.tokens } }
                    : { balance: { increment: params.tokens }, lifetimeCredit: { increment: params.tokens } },
            }),
            this.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    tenantId,
                    type: params.type,
                    status: 'WTX_COMPLETED',
                    tokens: params.tokens,
                    balanceBefore,
                    balanceAfter,
                    description: params.description,
                    referenceType: params.referenceType,
                    referenceId: params.referenceId,
                    metadata: params.metadata,
                    createdById: params.createdById,
                },
            }),
        ]);
        return {
            transaction,
            newBalance: updatedWallet.balance + updatedWallet.promoBalance,
        };
    }
    async refund(transactionId) {
        const original = await this.prisma.walletTransaction.findUnique({
            where: { id: transactionId },
        });
        if (!original)
            throw new common_1.NotFoundException('Transaction not found');
        if (original.type !== 'DEBIT')
            throw new common_1.BadRequestException('Can only refund debit transactions');
        if (original.status !== 'WTX_COMPLETED')
            throw new common_1.BadRequestException('Transaction already reversed');
        const wallet = await this.walletService.getOrCreate(original.tenantId);
        const refundTokens = Math.abs(original.tokens);
        const balanceBefore = wallet.balance + wallet.promoBalance;
        const balanceAfter = balanceBefore + refundTokens;
        const [updatedWallet, refundTxn] = await this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { increment: refundTokens },
                    lifetimeDebit: { decrement: refundTokens },
                },
            }),
            this.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    tenantId: original.tenantId,
                    type: 'REFUND',
                    status: 'WTX_COMPLETED',
                    tokens: refundTokens,
                    balanceBefore,
                    balanceAfter,
                    description: `Refund: ${original.description}`,
                    serviceKey: original.serviceKey,
                    referenceType: 'REFUND',
                    referenceId: original.id,
                    metadata: { originalTransactionId: original.id },
                },
            }),
            this.prisma.walletTransaction.update({
                where: { id: transactionId },
                data: { status: 'WTX_REVERSED' },
            }),
        ]);
        return {
            transaction: refundTxn,
            newBalance: updatedWallet.balance + updatedWallet.promoBalance,
        };
    }
    async getHistory(tenantId, params) {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = { tenantId };
        if (params?.type)
            where.type = params.type;
        if (params?.from || params?.to) {
            where.createdAt = {};
            if (params.from)
                where.createdAt.gte = new Date(params.from);
            if (params.to)
                where.createdAt.lte = new Date(params.to);
        }
        const [data, total] = await Promise.all([
            this.prisma.walletTransaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.walletTransaction.count({ where }),
        ]);
        return { data, total, page, limit };
    }
};
exports.WalletTransactionService = WalletTransactionService;
exports.WalletTransactionService = WalletTransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService])
], WalletTransactionService);
//# sourceMappingURL=wallet-transaction.service.js.map