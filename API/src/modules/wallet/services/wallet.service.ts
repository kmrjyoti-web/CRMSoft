import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(tenantId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { tenantId } });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          tenantId,
          balance: 0,
          promoBalance: 0,
          lifetimeCredit: 0,
          lifetimeDebit: 0,
          currency: 'INR',
          tokenRate: 100,
          isActive: true,
        },
      });
    }

    return wallet;
  }

  async getBalance(tenantId: string) {
    const wallet = await this.getOrCreate(tenantId);
    return {
      id: wallet.id,
      balance: wallet.balance,
      promoBalance: wallet.promoBalance,
      totalAvailable: wallet.balance + wallet.promoBalance,
      lifetimeCredit: wallet.lifetimeCredit,
      lifetimeDebit: wallet.lifetimeDebit,
      currency: wallet.currency,
      tokenRate: wallet.tokenRate,
      isActive: wallet.isActive,
    };
  }

  async ensureSufficientBalance(tenantId: string, tokens: number) {
    const wallet = await this.getOrCreate(tenantId);
    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is inactive');
    }
    const totalAvailable = wallet.balance + wallet.promoBalance;
    if (totalAvailable < tokens) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required: ${tokens} tokens, Available: ${totalAvailable} tokens`,
      );
    }
    return wallet;
  }

  async activate(tenantId: string) {
    return this.prisma.wallet.update({
      where: { tenantId },
      data: { isActive: true },
    });
  }

  async deactivate(tenantId: string) {
    return this.prisma.wallet.update({
      where: { tenantId },
      data: { isActive: false },
    });
  }

  async findAll(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.wallet.findMany({
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.wallet.count(),
    ]);

    return { data, total, page, limit };
  }
}
