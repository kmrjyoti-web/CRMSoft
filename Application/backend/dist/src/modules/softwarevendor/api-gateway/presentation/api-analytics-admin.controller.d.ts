import { ApiAnalyticsService } from '../services/api-analytics.service';
export declare class ApiAnalyticsAdminController {
    private readonly analytics;
    constructor(analytics: ApiAnalyticsService);
    getUsageSummary(req: any, from?: string, to?: string): Promise<{
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
    getWebhookStats(req: any): Promise<{
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
