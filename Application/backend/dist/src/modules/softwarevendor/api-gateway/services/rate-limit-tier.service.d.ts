import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class RateLimitTierService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getTierForPlan(planCode: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        planName: string;
        planCode: string;
        requestsPerMinute: number;
        requestsPerHour: number;
        requestsPerDay: number;
        maxApiKeys: number;
        maxWebhookEndpoints: number;
        burstLimit: number;
        burstWindowSeconds: number;
        webhookRatePerMinute: number;
        maxResponseSizeKb: number;
        maxRequestBodyKb: number;
    } | null>;
    getAllTiers(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        planName: string;
        planCode: string;
        requestsPerMinute: number;
        requestsPerHour: number;
        requestsPerDay: number;
        maxApiKeys: number;
        maxWebhookEndpoints: number;
        burstLimit: number;
        burstWindowSeconds: number;
        webhookRatePerMinute: number;
        maxResponseSizeKb: number;
        maxRequestBodyKb: number;
    }[]>;
    seedTiers(): Promise<void>;
}
