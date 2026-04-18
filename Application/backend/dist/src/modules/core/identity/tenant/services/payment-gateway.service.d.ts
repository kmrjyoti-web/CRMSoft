import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class PaymentGatewayService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createSubscription(tenantId: string, planId: string): Promise<{
        gatewayId: string;
    }>;
    cancelSubscription(gatewayId: string): Promise<void>;
    handleWebhook(body: any, signature: string): Promise<{
        event: string;
        tenantId?: string;
        gatewayPaymentId?: string;
        amount?: number;
    }>;
}
