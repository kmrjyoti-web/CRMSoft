import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { RazorpayGatewayService, RazorpayCredentials, GatewayOrderResult, GatewayRefundResult } from './razorpay-gateway.service';
import { StripeGatewayService, StripeCredentials } from './stripe-gateway.service';

@Injectable()
export class PaymentGatewayFactoryService {
  private readonly logger = new Logger(PaymentGatewayFactoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpay: RazorpayGatewayService,
    private readonly stripe: StripeGatewayService,
  ) {}

  /** Get decrypted credentials for a gateway from TenantCredential */
  async getCredentials(tenantId: string, gateway: 'RAZORPAY' | 'STRIPE'): Promise<any> {
    const provider = gateway === 'RAZORPAY' ? 'RAZORPAY' : 'STRIPE';

    const credential = await this.prisma.tenantCredential.findFirst({
      where: { tenantId, provider, status: 'ACTIVE' },
    });

    if (!credential) {
      throw AppError.from('PAYMENT_GATEWAY_NOT_CONFIGURED');
    }

    try {
      return JSON.parse(credential.encryptedData);
    } catch {
      throw AppError.from('PAYMENT_GATEWAY_ERROR');
    }
  }

  /** Create a gateway order (Razorpay order or Stripe PaymentIntent) */
  async createOrder(
    tenantId: string,
    gateway: 'RAZORPAY' | 'STRIPE',
    amount: number,
    currency: string,
    receiptId: string,
    metadata: Record<string, string> = {},
  ): Promise<GatewayOrderResult> {
    const creds = await this.getCredentials(tenantId, gateway);

    if (gateway === 'RAZORPAY') {
      return this.razorpay.createOrder(
        creds as RazorpayCredentials,
        Math.round(amount * 100),
        currency,
        receiptId,
        metadata,
      );
    }

    return this.stripe.createOrder(
      creds as StripeCredentials,
      Math.round(amount * 100),
      currency,
      metadata,
    );
  }

  /** Verify gateway payment */
  async verifyPayment(
    tenantId: string,
    gateway: 'RAZORPAY' | 'STRIPE',
    orderId: string,
    paymentId: string,
    signature: string,
  ) {
    const creds = await this.getCredentials(tenantId, gateway);

    if (gateway === 'RAZORPAY') {
      return this.razorpay.verifySignature(
        creds as RazorpayCredentials,
        orderId,
        paymentId,
        signature,
      );
    }

    return this.stripe.verifyPayment(creds as StripeCredentials, orderId);
  }

  /** Initiate refund via gateway */
  async initiateRefund(
    tenantId: string,
    gateway: 'RAZORPAY' | 'STRIPE',
    paymentId: string,
    amount: number,
    reason?: string,
  ): Promise<GatewayRefundResult> {
    const creds = await this.getCredentials(tenantId, gateway);

    if (gateway === 'RAZORPAY') {
      return this.razorpay.createRefund(
        creds as RazorpayCredentials,
        paymentId,
        Math.round(amount * 100),
        { reason: reason || 'Customer requested' },
      );
    }

    return this.stripe.createRefund(
      creds as StripeCredentials,
      paymentId,
      Math.round(amount * 100),
      reason,
    );
  }
}
