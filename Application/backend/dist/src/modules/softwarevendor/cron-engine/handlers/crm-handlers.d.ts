import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
export declare class LeadAutoExpireHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "LEAD_AUTO_EXPIRE";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(params: Record<string, any>): Promise<CronJobResult>;
}
export declare class QuotationExpiryHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "QUOTATION_EXPIRY";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class RecalcSalesTargetsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "RECALC_SALES_TARGETS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class ProcessRemindersHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "PROCESS_REMINDERS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class CheckOverdueFollowUpsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "CHECK_OVERDUE_FOLLOWUPS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class GenerateRecurrencesHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "GENERATE_RECURRENCES";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class CheckSlaBreachesHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "CHECK_SLA_BREACHES";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
