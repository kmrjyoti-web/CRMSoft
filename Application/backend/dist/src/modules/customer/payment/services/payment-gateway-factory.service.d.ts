import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RazorpayGatewayService, GatewayOrderResult, GatewayRefundResult } from './razorpay-gateway.service';
import { StripeGatewayService } from './stripe-gateway.service';
export declare class PaymentGatewayFactoryService {
    private readonly prisma;
    private readonly razorpay;
    private readonly stripe;
    private readonly logger;
    constructor(prisma: PrismaService, razorpay: RazorpayGatewayService, stripe: StripeGatewayService);
    getCredentials(tenantId: string, gateway: 'RAZORPAY' | 'STRIPE'): Promise<any>;
    createOrder(tenantId: string, gateway: 'RAZORPAY' | 'STRIPE', amount: number, currency: string, receiptId: string, metadata?: Record<string, string>): Promise<GatewayOrderResult>;
    verifyPayment(tenantId: string, gateway: 'RAZORPAY' | 'STRIPE', orderId: string, paymentId: string, signature: string): Promise<import("./razorpay-gateway.service").GatewayVerifyResult>;
    initiateRefund(tenantId: string, gateway: 'RAZORPAY' | 'STRIPE', paymentId: string, amount: number, reason?: string): Promise<GatewayRefundResult>;
}
