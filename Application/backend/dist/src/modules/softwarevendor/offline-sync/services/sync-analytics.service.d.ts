import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface SyncDashboard {
    totalDevices: number;
    activeDevices: number;
    inactiveDevices: number;
    blockedDevices: number;
    totalConflicts: number;
    pendingConflicts: number;
    totalFlushCommands: number;
    pendingFlushCommands: number;
    avgPendingUploads: number;
    entitiesWithMostConflicts: {
        entityName: string;
        count: number;
    }[];
}
export declare class SyncAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<SyncDashboard>;
    getAuditLog(filters: {
        userId?: string;
        deviceId?: string;
        action?: string;
        entityName?: string;
        dateFrom?: Date;
        dateTo?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Record<string, unknown>[];
        total: number;
    }>;
    getAnalytics(dateFrom?: Date, dateTo?: Date): Promise<Record<string, unknown>>;
}
