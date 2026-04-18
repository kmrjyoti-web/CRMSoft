import { PrismaService } from '../../../../../core/prisma/prisma.service';
export interface NotificationAnalytics {
    totalSent: number;
    deliveryRate: number;
    readRate: number;
    failureRate: number;
    byChannel: Array<{
        channel: string;
        count: number;
    }>;
    byEvent: Array<{
        eventType: string;
        count: number;
    }>;
    topFailureReasons: Array<{
        reason: string;
        count: number;
    }>;
}
export declare class NotificationAnalyticsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAnalytics(tenantId: string, startDate: Date, endDate: Date): Promise<NotificationAnalytics>;
}
