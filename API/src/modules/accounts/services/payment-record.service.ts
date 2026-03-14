import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class PaymentRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, data: {
    paymentType: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    referenceType?: string;
    referenceId?: string;
    amount: number;
    paymentMode: string;
    bankAccountId?: string;
    chequeNumber?: string;
    chequeDate?: string;
    transactionRef?: string;
    upiId?: string;
    tdsApplicable?: boolean;
    tdsRate?: number;
    tdsSection?: string;
    paymentDate: string;
    narration?: string;
  }) {
    const number = await this.generateNumber(tenantId, data.paymentType);

    // Calculate TDS if applicable
    let tdsAmount: number | undefined;
    if (data.tdsApplicable && data.tdsRate) {
      tdsAmount = Math.round(data.amount * data.tdsRate / 100 * 100) / 100;
    }

    const payment = await this.prisma.paymentRecord.create({
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

  async approve(tenantId: string, userId: string, id: string) {
    const payment = await this.prisma.paymentRecord.findFirst({ where: { id, tenantId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'DRAFT' && payment.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException(`Cannot approve payment in ${payment.status} status`);
    }

    // Create accounting transaction
    const isPaymentOut = payment.paymentType === 'PAYMENT_OUT';
    const debitLedger = await this.getLedger(tenantId, isPaymentOut ? 'ACCOUNTS_PAYABLE' : payment.paymentMode === 'CASH' ? 'CASH' : 'BANK');
    const creditLedger = await this.getLedger(tenantId, isPaymentOut ? (payment.paymentMode === 'CASH' ? 'CASH' : 'BANK') : 'ACCOUNTS_RECEIVABLE');

    let accountTxnId: string | undefined;
    if (debitLedger && creditLedger) {
      const txn = await this.prisma.accountTransaction.create({
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

      // Update ledger balances
      await this.prisma.ledgerMaster.update({
        where: { id: debitLedger.id },
        data: { currentBalance: { increment: Number(payment.amount) } },
      });
      await this.prisma.ledgerMaster.update({
        where: { id: creditLedger.id },
        data: { currentBalance: { decrement: Number(payment.amount) } },
      });
    }

    // Update bank account balance
    if (payment.bankAccountId) {
      const balanceChange = isPaymentOut ? -Number(payment.amount) : Number(payment.amount);
      await this.prisma.bankAccount.update({
        where: { id: payment.bankAccountId },
        data: { currentBalance: { increment: balanceChange } },
      });
    }

    // Create TDS record if applicable
    if (payment.tdsApplicable && payment.tdsAmount) {
      await this.prisma.tDSRecord.create({
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

    // Update payment status
    return this.prisma.paymentRecord.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: userId,
        accountTransactionId: accountTxnId,
      },
    });
  }

  async cancel(tenantId: string, id: string) {
    const payment = await this.prisma.paymentRecord.findFirst({ where: { id, tenantId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === 'RECONCILED') throw new BadRequestException('Cannot cancel reconciled payment');

    return this.prisma.paymentRecord.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async findAll(tenantId: string, filters?: {
    paymentType?: string;
    status?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    paymentMode?: string;
  }) {
    const where: any = { tenantId };
    if (filters?.paymentType) where.paymentType = filters.paymentType;
    if (filters?.status) where.status = filters.status;
    if (filters?.entityId) where.entityId = filters.entityId;
    if (filters?.paymentMode) where.paymentMode = filters.paymentMode;
    if (filters?.startDate || filters?.endDate) {
      where.paymentDate = {};
      if (filters?.startDate) where.paymentDate.gte = new Date(filters.startDate);
      if (filters?.endDate) where.paymentDate.lte = new Date(filters.endDate);
    }

    return this.prisma.paymentRecord.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const payment = await this.prisma.paymentRecord.findFirst({ where: { id, tenantId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getPending(tenantId: string) {
    return this.prisma.paymentRecord.findMany({
      where: { tenantId, status: { in: ['DRAFT', 'PENDING_APPROVAL'] } },
      orderBy: { paymentDate: 'asc' },
    });
  }

  async getOverdue(tenantId: string) {
    // Overdue purchase invoices (past due date, unpaid)
    return this.prisma.purchaseInvoice.findMany({
      where: {
        tenantId,
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
        dueDate: { lt: new Date() },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  private async getLedger(tenantId: string, code: string) {
    return this.prisma.ledgerMaster.findFirst({ where: { tenantId, code } });
  }

  private async generateNumber(tenantId: string, type: string): Promise<string> {
    const prefix = type === 'PAYMENT_OUT' ? 'PAY' : 'REC';
    const year = new Date().getFullYear();
    const count = await this.prisma.paymentRecord.count({
      where: { tenantId, paymentType: type },
    });
    return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private getTDSSectionName(section: string): string {
    const names: Record<string, string> = {
      '194C': 'Payment to Contractors',
      '194J': 'Professional/Technical Fees',
      '194H': 'Commission/Brokerage',
      '194I': 'Rent',
      '194A': 'Interest',
    };
    return names[section] || section;
  }

  private getQuarter(date: Date): string {
    const month = date.getMonth(); // 0-indexed
    if (month >= 3 && month <= 5) return 'Q1';
    if (month >= 6 && month <= 8) return 'Q2';
    if (month >= 9 && month <= 11) return 'Q3';
    return 'Q4';
  }

  private getFY(date: Date): string {
    const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
}
