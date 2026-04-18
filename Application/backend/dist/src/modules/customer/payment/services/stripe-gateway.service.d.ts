import { GatewayOrderResult, GatewayVerifyResult, GatewayRefundResult } from './razorpay-gateway.service';
export interface StripeCredentials {
    secretKey: string;
    publishableKey: string;
    webhookSecret?: string;
}
export declare class StripeGatewayService {
    private readonly logger;
    createOrder(credentials: StripeCredentials, amountInSmallestUnit: number, currency: string, metadata?: Record<string, string>): Promise<GatewayOrderResult>;
    verifyPayment(credentials: StripeCredentials, paymentIntentId: string): Promise<GatewayVerifyResult>;
    verifyWebhookSignature(webhookSecret: string, payload: string, signatureHeader: string): boolean;
    createRefund(credentials: StripeCredentials, chargeId: string, amountInSmallestUnit: number, reason?: string): Promise<GatewayRefundResult>;
}
