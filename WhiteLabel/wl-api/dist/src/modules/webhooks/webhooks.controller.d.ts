import { WebhooksService } from './webhooks.service';
interface RawRequest {
    rawBody?: Buffer;
}
export declare class WebhooksController {
    private webhooksService;
    constructor(webhooksService: WebhooksService);
    handleRazorpay(req: RawRequest, signature: string): Promise<{
        received: boolean;
    }>;
    getEvents(page?: string, limit?: string, status?: string, source?: string): Promise<{
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
export {};
