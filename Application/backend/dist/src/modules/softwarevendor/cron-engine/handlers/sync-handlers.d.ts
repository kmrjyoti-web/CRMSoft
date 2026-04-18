import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
export declare class ExpireFlushCommandsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "EXPIRE_FLUSH_COMMANDS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(params: Record<string, any>): Promise<CronJobResult>;
}
export declare class SyncChangelogCleanupHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "SYNC_CHANGELOG_CLEANUP";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(params: Record<string, any>): Promise<CronJobResult>;
}
export declare class SyncDeviceHealthHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "SYNC_DEVICE_HEALTH";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class AutoResolveConflictsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "AUTO_RESOLVE_CONFLICTS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
