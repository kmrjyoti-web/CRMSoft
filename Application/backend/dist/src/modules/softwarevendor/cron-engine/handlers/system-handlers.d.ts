import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
export declare class TokenRefreshHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "TOKEN_REFRESH";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class CredentialHealthCheckHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "CREDENTIAL_HEALTH_CHECK";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class AuditLogCleanupHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "AUDIT_LOG_CLEANUP";
    constructor(prisma: PrismaService);
    execute(params: Record<string, any>): Promise<CronJobResult>;
}
export declare class ResetDailyCountersHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "RESET_DAILY_COUNTERS";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class ExportFileCleanupHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "EXPORT_FILE_CLEANUP";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(params: Record<string, any>): Promise<CronJobResult>;
}
export declare class BackupDbHandler implements ICronJobHandler {
    readonly jobCode = "BACKUP_DB";
    private readonly logger;
    execute(params: Record<string, any>): Promise<CronJobResult>;
}
