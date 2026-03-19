import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { AutoNumberService } from '../../../core/identity/settings/services/auto-number.service';
import { PaymentGatewayFactoryService } from './payment-gateway-factory.service';
import { InvoiceService } from './invoice.service';
import { CreateRefundDto, RefundQueryDto } from '../presentation/dto/refund.dto';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly autoNumber: AutoNumberService,
    private readonly gatewayFactory: PaymentGatewayFactoryService,
    private readonly invoiceService: InvoiceService,
  ) {}

  /** Initiate a refund */
  async create(tenantId: string, dto: CreateRefundDto, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: dto.paymentId, tenantId },
      include: { refunds: true },
    });
    if (!payment) throw AppError.from('PAYMENT_NOT_FOUND');

    const totalRefunded = payment.refunds
      .filter((r) => r.status !== 'REFUND_CANCELLED')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const availableForRefund = Number(payment.amount) - totalRefunded;
    if (dto.amount > availableForRefund) throw AppError.from('REFUND_EXCEEDS_PAYMENT');

    const refundNo = await this.autoNumber.next(tenantId, 'Refund');

    let gatewayRefundId: string | null = null;
    let gatewayResponse: any = null;
    let status: 'REFUND_PENDING' | 'REFUND_PROCESSED' = 'REFUND_PENDING';

    // If online payment, initiate refund via gateway
    if (payment.gateway !== 'MANUAL' && payment.gatewayPaymentId) {
      try {
        const result = await this.gatewayFactory.initiateRefund(
          tenantId,
          payment.gateway as 'RAZORPAY' | 'STRIPE',
          payment.gatewayPaymentId,
          dto.amount,
          dto.reason,
        );
        gatewayRefundId = result.refundId;
        if (result.status === 'processed' || result.status === 'succeeded') {
          status = 'REFUND_PROCESSED';
        }
      } catch (err) {
        this.logger.error(`Gateway refund failed: ${getErrorMessage(err)}`);
        // Still create the refund record as pending
      }
    } else {
      // Manual payment — auto-process
      status = 'REFUND_PROCESSED';
    }

    const refund = await this.prisma.refund.create({
      data: {
        tenantId,
        refundNo,
        paymentId: dto.paymentId,
        amount: dto.amount,
        reason: dto.reason,
        status,
        gatewayRefundId,
        gatewayResponse,
        processedAt: status === 'REFUND_PROCESSED' ? new Date() : null,
        processedById: status === 'REFUND_PROCESSED' ? userId : null,
        createdById: userId,
      },
    });

    // Update payment status
    if (totalRefunded + dto.amount >= Number(payment.amount)) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PARTIALLY_REFUNDED' },
      });
    }

    await this.invoiceService.recalculateBalance(payment.invoiceId);

    this.logger.log(`Refund ${refundNo} created for payment ${payment.paymentNo}`);
    return refund;
  }

  /** Get refund by ID */
  async getById(tenantId: string, refundId: string) {
    const refund = await this.prisma.refund.findFirst({
      where: { id: refundId, tenantId },
      include: { payment: { include: { invoice: true } } },
    });
    if (!refund) throw AppError.from('REFUND_NOT_FOUND');
    return refund;
  }

  /** List refunds */
  async list(tenantId: string, query: RefundQueryDto) {
    const where: any = { tenantId };
    if (query.paymentId) where.paymentId = query.paymentId;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        include: { payment: { select: { paymentNo: true, invoice: { select: { invoiceNo: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.refund.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
