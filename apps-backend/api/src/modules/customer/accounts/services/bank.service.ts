import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class BankService {
  constructor(private readonly prisma: PrismaService) {}

  async createBankAccount(tenantId: string, data: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    ifscCode: string;
    branchName?: string;
    ledgerId?: string;
    openingBalance?: number;
    isDefault?: boolean;
  }) {
    // Auto-create ledger if not provided
    let ledgerId = data.ledgerId;
    if (!ledgerId) {
      const ledger = await this.prisma.working.ledgerMaster.create({
        data: {
          tenantId,
          code: `BANK_${data.accountNumber.slice(-4)}`,
          name: `${data.bankName} - ${data.accountNumber.slice(-4)}`,
          groupType: 'ASSET',
          subGroup: 'BANK',
          openingBalance: data.openingBalance ?? 0,
          currentBalance: data.openingBalance ?? 0,
        },
      });
      ledgerId = ledger.id;
    }

    return this.prisma.working.bankAccount.create({
      data: {
        tenantId,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        ifscCode: data.ifscCode,
        branchName: data.branchName,
        ledgerId,
        openingBalance: data.openingBalance ?? 0,
        currentBalance: data.openingBalance ?? 0,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async listBankAccounts(tenantId: string) {
    return this.prisma.working.bankAccount.findMany({
      where: { tenantId, isActive: true },
      orderBy: { bankName: 'asc' },
    });
  }

  async getReconciliation(tenantId: string, bankAccountId: string) {
    const bank = await this.prisma.working.bankAccount.findFirst({ where: { id: bankAccountId, tenantId } });
    if (!bank) throw new NotFoundException('Bank account not found');

    // Get unreconciled payments (APPROVED but not RECONCILED)
    const unreconciled = await this.prisma.working.paymentRecord.findMany({
      where: {
        tenantId,
        bankAccountId,
        status: 'APPROVED',
      },
      orderBy: { paymentDate: 'desc' },
    });

    return {
      bankAccount: bank,
      bookBalance: Number(bank.currentBalance),
      unreconciledPayments: unreconciled,
      unreconciledCount: unreconciled.length,
    };
  }

  async submitReconciliation(tenantId: string, userId: string, data: {
    bankAccountId: string;
    reconciliationDate: string;
    statementBalance: number;
  }) {
    const bank = await this.prisma.working.bankAccount.findFirst({ where: { id: data.bankAccountId, tenantId } });
    if (!bank) throw new NotFoundException('Bank account not found');

    const bookBalance = Number(bank.currentBalance);
    const difference = Math.round((data.statementBalance - bookBalance) * 100) / 100;

    const recon = await this.prisma.working.bankReconciliation.create({
      data: {
        tenantId,
        bankAccountId: data.bankAccountId,
        reconciliationDate: new Date(data.reconciliationDate),
        statementBalance: data.statementBalance,
        bookBalance,
        difference,
        status: difference === 0 ? 'COMPLETED' : 'IN_PROGRESS',
        reconciledById: userId,
        completedAt: difference === 0 ? new Date() : undefined,
      },
    });

    // If balanced, mark all approved payments as reconciled
    if (difference === 0) {
      await this.prisma.working.paymentRecord.updateMany({
        where: { tenantId, bankAccountId: data.bankAccountId, status: 'APPROVED' },
        data: { status: 'RECONCILED' },
      });
    }

    return recon;
  }
}
