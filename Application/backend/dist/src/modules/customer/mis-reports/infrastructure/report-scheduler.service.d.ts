import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ReportEngineService } from './report-engine.service';
import { ReportEmailerService } from './report-emailer.service';
export declare class ReportSchedulerService {
    private readonly prisma;
    private readonly engine;
    private readonly emailer;
    private readonly logger;
    constructor(prisma: PrismaService, engine: ReportEngineService, emailer: ReportEmailerService);
    processScheduledReports(): Promise<void>;
    private processOne;
    private checkAndPauseIfNeeded;
    calculateNextScheduledAt(frequency: string, dayOfWeek?: number | null, dayOfMonth?: number | null, timeOfDay?: string | null): Date;
    private getDateFrom;
    sendDailyDigest(): Promise<void>;
    cleanOldExports(): Promise<void>;
    private daysInMonth;
}
