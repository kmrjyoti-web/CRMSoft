import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { AutoNumberService } from '../../../core/identity/settings/services/auto-number.service';
import { PaymentGatewayFactoryService } from './payment-gateway-factory.service';
import { InvoiceService } from './invoice.service';
import { RecordPaymentDto, CreateGatewayOrderDto, VerifyGatewayPaymentDto, PaymentQueryDto } from '../presentation/dto/payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly autoNumber: AutoNumberService,
    private readonly gatewayFactory: PaymentGatewayFactoryService,
    private readonly invoiceService: InvoiceService,
  ) {}

  /** Record an offline/manual payment */
  async recordPayment(tenantId: string, dto: RecordPaymentDto, userId: string) {
    const invoice = await this.prisma.working.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!invoice) throw AppError.from('INVOICE_NOT_FOUND');
    if (invoice.status === 'CANCELLED') throw AppError.from('INVOICE_CANCELLED');
    if (invoice.status === 'VOID') throw AppError.from('INVOICE_VOID');

    const balance = Number(invoice.balanceAmount);
    if (dto.amount > balance) throw AppError.from('PAYMENT_EXCEEDS_BALANCE');

    const paymentNo = await this.autoNumber.next(tenantId, 'Payment');

    const payment = await this.prisma.working.payment.create({
      data: {
        tenantId,
        paymentNo,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        status: 'CAPTURED',
        method: dto.method,
        gateway: dto.gateway || 'MANUAL',
        chequeNumber: dto.chequeNumber,
        chequeDate: dto.chequeDate ? new Date(dto.chequeDate) : null,
        chequeBankName: dto.chequeBankName,
        transactionRef: dto.transactionRef,
        upiTransactionId: dto.upiTransactionId,
        notes: dto.notes,
        paidAt: new Date(),
        recordedById: userId,
      },
    });

    await this.invoiceService.recalculateBalance(dto.invoiceId);

    this.logger.log(`Payment ${paymentNo} recorded for invoice ${invoice.invoiceNo}`);
    return payment;
  }

  /** Create a gateway order for online payment */
  async createGatewayOrder(tenantId: string, dto: CreateGatewayOrderDto, userId: string) {
    const invoice = await this.prisma.working.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!invoice) throw AppError.from('INVOICE_NOT_FOUND');
    if (invoice.status === 'CANCELLED') throw AppError.from('INVOICE_CANCELLED');

    const balance = Number(invoice.balanceAmount);
    if (dto.amount > balance) throw AppError.from('PAYMENT_EXCEEDS_BALANCE');

    const paymentNo = await this.autoNumber.next(tenantId, 'Payment');

    const gatewayOrder = await this.gatewayFactory.createOrder(
      tenantId,
      dto.gateway as 'RAZORPAY' | 'STRIPE',
      dto.amount,
      'INR',
      paymentNo,
      { invoiceId: dto.invoiceId, tenantId },
    );

    const payment = await this.prisma.working.payment.create({
      data: {
        tenantId,
        paymentNo,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        status: 'PENDING',
        method: dto.gateway === 'RAZORPAY' ? 'RAZORPAY' : 'STRIPE',
        gateway: dto.gateway,
        gatewayOrderId: gatewayOrder.orderId,
        recordedById: userId,
      },
    });

    return {
      payment,
      gatewayOrder,
    };
  }

  /** Verify and capture gateway payment */
  async verifyGatewayPayment(tenantId: string, dto: VerifyGatewayPaymentDto) {
    const payment = await this.prisma.working.payment.findFirst({
      where: { gatewayOrderId: dto.gatewayOrderId, tenantId },
    });
    if (!payment) throw AppError.from('PAYMENT_NOT_FOUND');
    if (payment.status === 'CAPTURED') throw AppError.from('PAYMENT_ALREADY_CAPTURED');

    const result = await this.gatewayFactory.verifyPayment(
      tenantId,
      payment.gateway as 'RAZORPAY' | 'STRIPE',
      dto.gatewayOrderId,
      dto.gatewayPaymentId,
      dto.gatewaySignature,
    );

    if (!result.verified) {
      await this.prisma.working.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: 'Signature verification failed',
          gatewayPaymentId: dto.gatewayPaymentId,
        },
      });
      throw AppError.from('PAYMENT_SIGNATURE_INVALID');
    }

    const updated = await this.prisma.working.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        gatewayPaymentId: dto.gatewayPaymentId,
        gatewaySignature: dto.gatewaySignature,
        paidAt: new Date(),
      },
    });

    await this.invoiceService.recalculateBalance(payment.invoiceId);

    this.logger.log(`Payment ${payment.paymentNo} verified and captured`);
    return updated;
  }

  /** Get payment by ID */
  async getById(tenantId: string, paymentId: string) {
    const payment = await this.prisma.working.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: { invoice: true, receipt: true, refunds: true },
    });
    if (!payment) throw AppError.from('PAYMENT_NOT_FOUND');
    return payment;
  }

  /** List payments */
  async list(tenantId: string, query: PaymentQueryDto) {
    const where: any = { tenantId };
    if (query.invoiceId) where.invoiceId = query.invoiceId;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.working.payment.findMany({
        where,
        include: { invoice: { select: { invoiceNo: true, billingName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.payment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Handle webhook event from payment gateway */
  async handleWebhook(tenantId: string, gateway: 'RAZORPAY' | 'STRIPE', event: string, payload: any) {
    this.logger.log(`Webhook received: ${gateway} ${event}`);

    if (gateway === 'RAZORPAY') {
      return this.handleRazorpayWebhook(tenantId, event, payload);
    }
    return this.handleStripeWebhook(tenantId, event, payload);
  }

  private async handleRazorpayWebhook(tenantId: string, event: string, payload: any) {
    if (event === 'payment.captured') {
      const rpPaymentId = payload.payment?.entity?.id;
      const rpOrderId = payload.payment?.entity?.order_id;

      if (rpOrderId) {
        const payment = await this.prisma.working.payment.findFirst({
          where: { gatewayOrderId: rpOrderId, tenantId },
        });
        if (payment && payment.status === 'PENDING') {
          await this.prisma.working.payment.update({
            where: { id: payment.id },
            data: {
              status: 'CAPTURED',
              gatewayPaymentId: rpPaymentId,
              gatewayResponse: payload,
              paidAt: new Date(),
            },
          });
          await this.invoiceService.recalculateBalance(payment.invoiceId);
        }
      }
    }

    if (event === 'refund.processed') {
      const rpRefundId = payload.refund?.entity?.id;
      if (rpRefundId) {
        await this.prisma.working.refund.updateMany({
          where: { gatewayRefundId: rpRefundId },
          data: { status: 'REFUND_PROCESSED', processedAt: new Date(), gatewayResponse: payload },
        });
      }
    }
  }

  private async handleStripeWebhook(tenantId: string, event: string, payload: any) {
    if (event === 'payment_intent.succeeded') {
      const intentId = payload.data?.object?.id;
      if (intentId) {
        const payment = await this.prisma.working.payment.findFirst({
          where: { gatewayOrderId: intentId, tenantId },
        });
        if (payment && payment.status === 'PENDING') {
          await this.prisma.working.payment.update({
            where: { id: payment.id },
            data: {
              status: 'CAPTURED',
              gatewayPaymentId: payload.data?.object?.latest_charge,
              gatewayResponse: payload,
              paidAt: new Date(),
            },
          });
          await this.invoiceService.recalculateBalance(payment.invoiceId);
        }
      }
    }

    if (event === 'charge.refunded') {
      const chargeId = payload.data?.object?.id;
      if (chargeId) {
        const refund = payload.data?.object?.refunds?.data?.[0];
        if (refund) {
          await this.prisma.working.refund.updateMany({
            where: { gatewayRefundId: refund.id },
            data: { status: 'REFUND_PROCESSED', processedAt: new Date(), gatewayResponse: payload },
          });
        }
      }
    }
  }
}
