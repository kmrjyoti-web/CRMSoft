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
export declare class RazorpayGatewayService {
    private readonly logger;
    createOrder(credentials: RazorpayCredentials, amountInPaise: number, currency: string, receiptId: string, notes?: Record<string, string>): Promise<GatewayOrderResult>;
    verifySignature(credentials: RazorpayCredentials, orderId: string, paymentId: string, signature: string): GatewayVerifyResult;
    verifyWebhookSignature(webhookSecret: string, body: string, signature: string): boolean;
    createRefund(credentials: RazorpayCredentials, paymentId: string, amountInPaise: number, notes?: Record<string, string>): Promise<GatewayRefundResult>;
}
