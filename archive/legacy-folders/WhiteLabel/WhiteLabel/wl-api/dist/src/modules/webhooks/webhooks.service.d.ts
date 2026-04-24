import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { AuditService } from '../audit/audit.service';
export declare class WebhooksService {
    private prisma;
    private billing;
    private audit;
    private readonly logger;
    constructor(prisma: PrismaService, billing: BillingService, audit: AuditService);
    verifyRazorpaySignature(rawBody: Buffer, signature: string): boolean;
    handleRazorpayEvent(rawBody: Buffer, signature: string): Promise<void>;
    private processRazorpayEvent;
    private onPaymentCaptured;
    private onPaymentFailed;
    private onRefundCreated;
    getEvents(params: {
        page?: number;
        limit?: number;
        status?: string;
        source?: string;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            isVerified: boolean;
            source: string;
            eventType: string;
            payload: import("@prisma/client/runtime/client").JsonValue;
            signature: string;
            processingStatus: import("@prisma/client").$Enums.WebhookEventStatus;
            errorMessage: string | null;
            processedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getDashboard(): Promise<{
        total: number;
        processed: number;
        failed: number;
        pending: number;
        last24h: number;
        successRate: number;
    }>;
}
