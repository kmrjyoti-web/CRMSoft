import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class WalletAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSpendByCategory(tenantId?: string, days?: number): Promise<{
        category: string;
        tokens: number;
    }[]>;
    getTopServices(tenantId?: string, days?: number, limit?: number): Promise<{
        tokens: number;
        count: number;
        serviceKey: string;
    }[]>;
    getDailySpendTrend(tenantId?: string, days?: number): Promise<{
        date: string;
        tokens: number;
    }[]>;
    getRevenueSummary(days?: number): Promise<{
        totalRecharged: number;
        totalSpent: number;
        activeWallets: number;
        totalWallets: number;
        periodDays: number;
    }>;
}
