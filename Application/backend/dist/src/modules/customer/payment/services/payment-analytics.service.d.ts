import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class PaymentAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCollectionSummary(tenantId: string, fromDate?: string, toDate?: string): Promise<{
        totalCollected: number;
        paymentCount: number;
        byMethod: {
            method: import("@prisma/working-client").$Enums.PaymentMethod;
            amount: number;
            count: number;
        }[];
        byGateway: {
            gateway: import("@prisma/working-client").$Enums.PaymentGateway;
            amount: number;
            count: number;
        }[];
    }>;
    getOutstandingSummary(tenantId: string): Promise<{
        overdue: {
            count: number;
            amount: number;
        };
        partiallyPaid: {
            count: number;
            amount: number;
        };
        pending: {
            count: number;
            amount: number;
        };
        totalOutstanding: number;
    }>;
    getRefundSummary(tenantId: string): Promise<{
        totalRefunds: number;
        totalAmount: number;
        byStatus: {
            status: import("@prisma/working-client").$Enums.RefundStatus;
            count: number;
            amount: number;
        }[];
    }>;
}
