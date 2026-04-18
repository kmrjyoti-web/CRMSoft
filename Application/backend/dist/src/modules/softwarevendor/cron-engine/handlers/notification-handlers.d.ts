import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
export declare class NotificationCleanupHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "NOTIFICATION_CLEANUP";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(params: Record<string, any>): Promise<CronJobResult>;
}
export declare class DigestHourlyHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "DIGEST_HOURLY";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class DigestDailyHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "DIGEST_DAILY";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class DigestWeeklyHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "DIGEST_WEEKLY";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class RegroupNotificationsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "REGROUP_NOTIFICATIONS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class CleanupPushSubscriptionsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "CLEANUP_PUSH_SUBSCRIPTIONS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
