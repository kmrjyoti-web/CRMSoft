import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { JobRunnerService } from './job-runner.service';
import { CronParserService } from './cron-parser.service';
export declare class MasterSchedulerService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly runner;
    private readonly parser;
    private readonly logger;
    private scheduledTasks;
    constructor(prisma: PrismaService, runner: JobRunnerService, parser: CronParserService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    registerJob(jobCode: string): Promise<void>;
    cancelJob(jobCode: string): void;
    reloadAll(): Promise<void>;
    forceRun(jobCode: string, triggeredBy: string): Promise<any>;
    getScheduledStatus(): Array<{
        jobCode: string;
        isScheduled: boolean;
        nextRun: Date | null;
    }>;
    private scheduleJob;
    private cancelJobSync;
    private updateNextRun;
}
