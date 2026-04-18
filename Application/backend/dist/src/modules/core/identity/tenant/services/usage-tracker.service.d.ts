import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class UsageTrackerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    recalculate(tenantId: string): Promise<void>;
    incrementUsage(tenantId: string, resourceKey: string): Promise<void>;
    decrementUsage(tenantId: string, resourceKey: string): Promise<void>;
    getUsageDetails(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        resourceKey: string;
        currentCount: number;
        monthlyCount: number;
        monthYear: string | null;
        lastUpdated: Date;
    }[]>;
    resetMonthlyCounts(tenantId?: string): Promise<void>;
    private getLegacyField;
}
