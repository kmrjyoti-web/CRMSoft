import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { AutoNumberService } from '../../../core/identity/settings/services/auto-number.service';
import { CrossService } from '../../../../common/decorators/cross-service.decorator';
import { PaymentGatewayFactoryService } from './payment-gateway-factory.service';
import { InvoiceService } from './invoice.service';
import { CreateRefundDto, RefundQueryDto } from '../presentation/dto/refund.dto';
import { getErrorMessage } from '@/common/utils/error.utils';

@CrossService('identity', 'Uses AutoNumberService from identity settings to generate refund reference numbers')
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
    const payment = await this.prisma.working.payment.findFirst({
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
