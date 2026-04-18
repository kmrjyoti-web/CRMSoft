import { PaymentService } from '../services/payment.service';
import { RazorpayGatewayService } from '../services/razorpay-gateway.service';
import { StripeGatewayService } from '../services/stripe-gateway.service';
import { PaymentGatewayFactoryService } from '../services/payment-gateway-factory.service';
export declare class PaymentWebhookController {
    private readonly paymentService;
    private readonly razorpay;
    private readonly stripe;
    private readonly gatewayFactory;
    private readonly logger;
    constructor(paymentService: PaymentService, razorpay: RazorpayGatewayService, stripe: StripeGatewayService, gatewayFactory: PaymentGatewayFactoryService);
    razorpayWebhook(tenantId: string, body: any, signature: string): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: string;
    }>;
    stripeWebhook(tenantId: string, body: any, signature: string): Promise<{
        status: string;
        message?: undefined;
    } | {
        status: string;
        message: string;
    }>;
}
