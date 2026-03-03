import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { AppError } from '../../../common/errors/app-error';

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

export interface GatewayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  gateway: string;
  meta: Record<string, any>;
}

export interface GatewayVerifyResult {
  verified: boolean;
  paymentId: string;
  orderId: string;
}

export interface GatewayRefundResult {
  refundId: string;
  status: string;
  amount: number;
}

@Injectable()
export class RazorpayGatewayService {
  private readonly logger = new Logger(RazorpayGatewayService.name);

  /** Create Razorpay order via API */
  async createOrder(
    credentials: RazorpayCredentials,
    amountInPaise: number,
    currency: string,
    receiptId: string,
    notes: Record<string, string> = {},
  ): Promise<GatewayOrderResult> {
    const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receiptId,
        notes,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Razorpay order creation failed: ${body}`);
      throw AppError.from('PAYMENT_GATEWAY_ERROR');
    }

    const order = await response.json();

    return {
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      gateway: 'RAZORPAY',
      meta: { keyId: credentials.keyId, orderId: order.id },
    };
  }

  /** Verify Razorpay payment signature */
  verifySignature(
    credentials: RazorpayCredentials,
    orderId: string,
    paymentId: string,
    signature: string,
  ): GatewayVerifyResult {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = createHmac('sha256', credentials.keySecret)
      .update(body)
      .digest('hex');

    const verified = expectedSignature === signature;

    if (!verified) {
      this.logger.warn(`Razorpay signature mismatch for order ${orderId}`);
    }

    return { verified, paymentId, orderId };
  }

  /** Verify webhook signature */
  verifyWebhookSignature(
    webhookSecret: string,
    body: string,
    signature: string,
  ): boolean {
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  /** Initiate refund via Razorpay API */
  async createRefund(
    credentials: RazorpayCredentials,
    paymentId: string,
    amountInPaise: number,
    notes: Record<string, string> = {},
  ): Promise<GatewayRefundResult> {
    const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        notes,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Razorpay refund failed: ${body}`);
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
