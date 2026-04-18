import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class WaAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverallAnalytics(wabaId: string, dateFrom?: Date, dateTo?: Date): Promise<{
        totalSent: number;
        totalReceived: number;
        totalDelivered: number;
        totalRead: number;
        totalFailed: number;
        deliveryRate: number;
        readRate: number;
        totalConversations: number;
        openConversations: number;
        resolvedConversations: number;
    }>;
    getAgentPerformance(wabaId: string, dateFrom?: Date, dateTo?: Date): Promise<any[]>;
    getBroadcastStats(broadcastId: string): Promise<{
        broadcast: {
            id: string;
            name: string;
            status: import("@prisma/working-client").$Enums.WaBroadcastStatus;
            totalRecipients: number;
            startedAt: Date | null;
            completedAt: Date | null;
        };
        stats: {
            sent: number;
            delivered: number;
            read: number;
            failed: number;
            optedOut: number;
        };
        recipientBreakdown: Record<string, number>;
    }>;
}
