import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { AppError } from '../../../../common/errors/app-error';
import { GatewayOrderResult, GatewayVerifyResult, GatewayRefundResult } from './razorpay-gateway.service';

export interface StripeCredentials {
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
}

@Injectable()
export class StripeGatewayService {
  private readonly logger = new Logger(StripeGatewayService.name);

  /** Create Stripe PaymentIntent */
  async createOrder(
    credentials: StripeCredentials,
    amountInSmallestUnit: number,
    currency: string,
    metadata: Record<string, string> = {},
  ): Promise<GatewayOrderResult> {
    const params = new URLSearchParams();
    params.set('amount', String(amountInSmallestUnit));
    params.set('currency', currency.toLowerCase());
    params.set('payment_method_types[]', 'card');
    Object.entries(metadata).forEach(([k, v]) => params.set(`metadata[${k}]`, v));

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${credentials.secretKey}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Stripe PaymentIntent creation failed: ${body}`);
      throw AppError.from('PAYMENT_GATEWAY_ERROR');
    }

    const intent = await response.json();

    return {
      orderId: intent.id,
      amount: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      gateway: 'STRIPE',
      meta: { clientSecret: intent.client_secret, publishableKey: credentials.publishableKey },
    };
  }

  /** Verify Stripe PaymentIntent status */
  async verifyPayment(
    credentials: StripeCredentials,
    paymentIntentId: string,
  ): Promise<GatewayVerifyResult> {
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        Authorization: `Bearer ${credentials.secretKey}`,
      },
    });

    if (!response.ok) {
      throw AppError.from('PAYMENT_GATEWAY_ERROR');
    }

    const intent = await response.json();
    const verified = intent.status === 'succeeded';

    return {
      verified,
      paymentId: intent.latest_charge || intent.id,
      orderId: intent.id,
    };
  }

  /** Verify Stripe webhook signature */
  verifyWebhookSignature(
    webhookSecret: string,
    payload: string,
    signatureHeader: string,
  ): boolean {
    const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parts['t'];
    const signature = parts['v1'];
    if (!timestamp || !signature) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const expected = createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  /** Initiate refund via Stripe API */
  async createRefund(
    credentials: StripeCredentials,
    chargeId: string,
    amountInSmallestUnit: number,
    reason?: string,
  ): Promise<GatewayRefundResult> {
    const params = new URLSearchParams();
    params.set('charge', chargeId);
    params.set('amount', String(amountInSmallestUnit));
    if (reason) params.set('reason', 'requested_by_customer');

    const response = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${credentials.secretKey}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Stripe refund failed: ${body}`);
      throw AppError.from('PAYMENT_GATEWAY_ERROR');
    }

    const refund = await response.json();

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    };
  }
}
