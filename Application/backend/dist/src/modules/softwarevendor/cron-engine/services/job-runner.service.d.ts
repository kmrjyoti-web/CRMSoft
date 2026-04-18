import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CronJobRunLog } from '@prisma/working-client';
import { JobRegistryService } from './job-registry.service';
import { CronParserService } from './cron-parser.service';
import { CronAlertService } from './cron-alert.service';
export declare class JobRunnerService {
    private readonly prisma;
    private readonly registry;
    private readonly parser;
    private readonly alert;
    private readonly logger;
    constructor(prisma: PrismaService, registry: JobRegistryService, parser: CronParserService, alert: CronAlertService);
    run(jobCode: string, triggeredBy?: string, retryAttempt?: number): Promise<CronJobRunLog | null>;
    private executeWithTimeout;
    private executeForAllTenants;
    private timeout;
    private handleFailure;
    private logSkipped;
    private updateJobSuccess;
    private safeNextRun;
    private calcSuccessRate;
}
