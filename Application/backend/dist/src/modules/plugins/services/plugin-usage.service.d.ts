import { PrismaService } from '../../../core/prisma/prisma.service';
interface UsageSummary {
    pluginCode: string;
    pluginName: string;
    category: string;
    monthlyUsage: number;
    monthlyLimit: number | null;
    usagePercent: number | null;
    lastUsedAt: Date | null;
    isEnabled: boolean;
}
interface UsageStats {
    totalPlugins: number;
    activePlugins: number;
    totalUsage: number;
    byCategory: Record<string, number>;
}
export declare class PluginUsageService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getTenantUsage(tenantId: string): Promise<UsageSummary[]>;
    getTenantStats(tenantId: string): Promise<UsageStats>;
    resetMonthlyUsage(): Promise<number>;
    checkQuota(tenantId: string, pluginCode: string): Promise<{
        allowed: boolean;
        usage: number;
        limit: number | null;
    }>;
    getRecentActivity(tenantId: string, pluginCode?: string, limit?: number): Promise<{
        id: string;
        tenantId: string;
        entityType: string | null;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        errorMessage: string | null;
        executedAt: Date;
        entityId: string | null;
        durationMs: number | null;
        pluginId: string;
        hookPoint: string;
        requestPayload: import("@prisma/platform-client/runtime/library").JsonValue | null;
        responsePayload: import("@prisma/platform-client/runtime/library").JsonValue | null;
    }[]>;
}
export {};
