import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class SyncSchedulerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    expireStaleFlushCommands(): Promise<void>;
    cleanOldChangeLogs(): Promise<void>;
    cleanOldAuditLogs(): Promise<void>;
    deviceHealthCheck(): Promise<void>;
    autoResolveOldConflicts(): Promise<void>;
    recalculateDeviceStorage(): Promise<void>;
    syncAnalyticsSnapshot(): Promise<void>;
}
