import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { AutoNumberService } from '../../../core/settings/services/auto-number.service';
import { AmountInWordsService } from './amount-in-words.service';

@Injectable()
export class ReceiptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly autoNumber: AutoNumberService,
    private readonly amountInWords: AmountInWordsService,
  ) {}

  /** Auto-generate receipt after payment capture */
  async generateForPayment(tenantId: string, paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: { invoice: true, receipt: true },
    });
    if (!payment) throw AppError.from('PAYMENT_NOT_FOUND');
    if (payment.receipt) return payment.receipt; // already generated

    const receiptNo = await this.autoNumber.next(tenantId, 'Receipt');
    const words = this.amountInWords.convert(Number(payment.amount));

    const receipt = await this.prisma.paymentReceipt.create({
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

  /** Get receipt by ID */
  async getById(tenantId: string, receiptId: string) {
    const receipt = await this.prisma.paymentReceipt.findFirst({
      where: { id: receiptId, tenantId },
      include: { payment: { include: { invoice: true } } },
    });
    if (!receipt) throw AppError.from('RECEIPT_NOT_FOUND');
    return receipt;
  }

  /** Get receipt by payment ID */
  async getByPaymentId(tenantId: string, paymentId: string) {
    const receipt = await this.prisma.paymentReceipt.findFirst({
      where: { paymentId, tenantId },
      include: { payment: { include: { invoice: true } } },
    });
    if (!receipt) throw AppError.from('RECEIPT_NOT_FOUND');
    return receipt;
  }

  /** List receipts for a tenant */
  async list(tenantId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.paymentReceipt.findMany({
        where: { tenantId },
        include: { payment: { select: { paymentNo: true, invoice: { select: { invoiceNo: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.paymentReceipt.count({ where: { tenantId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
