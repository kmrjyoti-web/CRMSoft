import { Job } from 'bull';
import { PrismaService } from "../../../../../core/prisma/prisma.service";
import { TestOrchestratorService } from '../../../test-runner/application/services/test-orchestrator.service';
import { IScheduledTestRepository } from '../../infrastructure/repositories/scheduled-test.repository';
import { IScheduledTestRunRepository } from '../../infrastructure/repositories/scheduled-test-run.repository';
import { BackupValidationService } from '../../infrastructure/services/backup-validation.service';
export declare const SCHEDULED_TEST_QUEUE = "SCHEDULED_TEST_QUEUE";
interface ScheduledTestJobPayload {
    scheduledTestId: string;
    scheduledTestRunId: string;
    triggeredBy?: string;
}
export declare class ScheduledTestProcessor {
    private readonly testRepo;
    private readonly runRepo;
    private readonly prisma;
    private readonly orchestrator;
    private readonly backupValidation;
    private readonly logger;
    constructor(testRepo: IScheduledTestRepository, runRepo: IScheduledTestRunRepository, prisma: PrismaService, orchestrator: TestOrchestratorService, backupValidation: BackupValidationService);
    executeScheduledTest(job: Job<ScheduledTestJobPayload>): Promise<void>;
    private computeNextRun;
}
export {};
