import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WalletService } from './wallet.service';

export interface DebitParams {
  tokens: number;
  description: string;
  serviceKey?: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdById?: string;
}

export interface CreditParams {
  tokens: number;
  description: string;
  type: 'CREDIT' | 'PROMO' | 'ADJUSTMENT';
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdById?: string;
}

@Injectable()
export class WalletTransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async debit(tenantId: string, params: DebitParams) {
    const wallet = await this.walletService.ensureSufficientBalance(tenantId, params.tokens);

    // Deduct from promo balance first, then main balance
    let promoDebit = 0;
    let mainDebit = 0;

    if (wallet.promoBalance >= params.tokens) {
      promoDebit = params.tokens;
    } else {
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

  async credit(tenantId: string, params: CreditParams) {
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

  async refund(transactionId: string) {
    const original = await this.prisma.walletTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!original) throw new NotFoundException('Transaction not found');
    if (original.type !== 'DEBIT') throw new BadRequestException('Can only refund debit transactions');
    if (original.status !== 'WTX_COMPLETED') throw new BadRequestException('Transaction already reversed');

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

  async getHistory(
    tenantId: string,
    params?: { type?: string; page?: number; limit?: number; from?: string; to?: string },
  ) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (params?.type) where.type = params.type;
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to) where.createdAt.lte = new Date(params.to);
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
}
