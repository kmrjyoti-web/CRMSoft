import { PrismaService } from '../../../../core/prisma/prisma.service';
import { WebhookService } from './webhook.service';
import { WebhookSignerService } from './webhook-signer.service';
export declare class WebhookDispatcherService {
    private readonly prisma;
    private readonly webhookService;
    private readonly signer;
    private readonly logger;
    constructor(prisma: PrismaService, webhookService: WebhookService, signer: WebhookSignerService);
    dispatch(tenantId: string, eventType: string, entityId: string, data: Record<string, any>): Promise<void>;
    private attemptDelivery;
    private handleFailure;
    retryFailedDeliveries(): Promise<{
        retried: number;
        succeeded: number;
        failed: number;
    }>;
    getDeliveries(tenantId: string, endpointId: string, page?: number, limit?: number): Promise<{
        data: {
            error: string | null;
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: import("@prisma/working-client").$Enums.WebhookDeliveryStatus;
            eventType: string;
            signature: string;
            responseBody: string | null;
            responseTimeMs: number | null;
            httpStatus: number | null;
            scheduledAt: Date;
            payload: import("@prisma/working-client/runtime/library").JsonValue;
            deliveredAt: Date | null;
            eventId: string;
            payloadSize: number | null;
            attempt: number;
            maxAttempts: number;
            nextRetryAt: Date | null;
            endpointId: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
