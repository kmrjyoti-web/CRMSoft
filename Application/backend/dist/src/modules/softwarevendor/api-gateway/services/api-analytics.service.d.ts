import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ApiAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUsageSummary(tenantId: string, from?: string, to?: string): Promise<{
        overview: {
            avgResponseTimeMs: number;
            uniqueApiKeys: number;
            success: number;
            clientErrors: number;
            serverErrors: number;
            rateLimited: number;
            totalRequests: number;
        };
        byStatusCode: {
            statusCode: number;
            count: number;
        }[];
        byEndpoint: {
            path: string;
            method: string;
            count: number;
            avgMs: number;
        }[];
        byApiKey: {
            keyId: string;
            keyName: string;
            requests: number;
        }[];
    }>;
    getWebhookStats(tenantId: string): Promise<{
        totalDeliveries: number;
        totalDelivered: number;
        totalFailed: number;
        successRate: number;
        avgResponseTimeMs: number;
        byEvent: {
            eventType: string;
            count: number;
        }[];
    }>;
}
