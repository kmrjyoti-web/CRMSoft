import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
export declare class CheckOverdueTasksHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "CHECK_OVERDUE_TASKS";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class CheckTaskEscalationsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "CHECK_TASK_ESCALATIONS";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class ProcessTaskRecurrenceHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "PROCESS_TASK_RECURRENCE";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
    private calculateNextDate;
}
export declare class CheckMissedRemindersHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "CHECK_MISSED_REMINDERS";
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
