import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject, Logger } from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';
import { PrismaService } from '@core/prisma/prisma.service';
import { TestType } from '@prisma/platform-client';
import { TestOrchestratorService } from '../../../test-runner/application/services/test-orchestrator.service';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../infrastructure/repositories/scheduled-test.repository';
import {
  SCHEDULED_TEST_RUN_REPOSITORY,
  IScheduledTestRunRepository,
} from '../../infrastructure/repositories/scheduled-test-run.repository';
import { BackupValidationService } from '../../infrastructure/services/backup-validation.service';

export const SCHEDULED_TEST_QUEUE = 'SCHEDULED_TEST_QUEUE';

interface ScheduledTestJobPayload {
  scheduledTestId: string;
  scheduledTestRunId: string;
  triggeredBy?: string;
}

@Processor(SCHEDULED_TEST_QUEUE)
export class ScheduledTestProcessor {
  private readonly logger = new Logger(ScheduledTestProcessor.name);

  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly testRepo: IScheduledTestRepository,
    @Inject(SCHEDULED_TEST_RUN_REPOSITORY)
    private readonly runRepo: IScheduledTestRunRepository,
    private readonly prisma: PrismaService,
    private readonly orchestrator: TestOrchestratorService,
    private readonly backupValidation: BackupValidationService,
  ) {}

  @Process('EXECUTE_SCHEDULED_TEST')
  async executeScheduledTest(job: Job<ScheduledTestJobPayload>): Promise<void> {
    const { scheduledTestId, scheduledTestRunId, triggeredBy } = job.data;
    this.logger.log(`Executing scheduled test: ${scheduledTestId}, run: ${scheduledTestRunId}`);

    const test = await this.testRepo.findById(scheduledTestId);
    if (!test) {
      this.logger.error(`ScheduledTest not found: ${scheduledTestId}`);
      return;
    }

    // Mark run as RUNNING
    await this.runRepo.update(scheduledTestRunId, { status: 'RUNNING' });

    try {
      // Find best backup for this tenant
      const backup = await this.backupValidation.findBestBackupForTesting(test.tenantId);
      if (backup) {
        await this.runRepo.update(scheduledTestRunId, { backupRecordId: backup.id });
      }

      // Create a TestRun record
      const testTypes = (test.testTypes as string[]).filter(t =>
        Object.values(TestType).includes(t as TestType),
      ) as TestType[];

      const testRun = await this.prisma.platform.testRun.create({
        data: {
          tenantId: test.tenantId,
          runType: 'SCHEDULED',
          testTypes: testTypes as any,
          targetModules: test.targetModules,
          createdById: triggeredBy ?? 'system',
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      await this.runRepo.update(scheduledTestRunId, { testRunId: testRun.id });

      // Build run config
      const config = {
        tenantId: test.tenantId,
        testEnvId: undefined,
        targetModules: test.targetModules,
      };

      // Run all tests via orchestrator
      await this.orchestrator.runAll(testRun.id, testTypes, config);

      // Get final status from DB
      const completed = await this.prisma.platform.testRun.findUnique({ where: { id: testRun.id } });
      const finalStatus = completed?.status ?? 'COMPLETED';

      await this.runRepo.update(scheduledTestRunId, {
        status: finalStatus,
        completedAt: new Date(),
      });

      await this.testRepo.update(scheduledTestId, {
        lastRunAt: new Date(),
        lastRunStatus: finalStatus as any,
        nextRunAt: this.computeNextRun(test.cronExpression),
      });

      this.logger.log(`ScheduledTest completed: ${scheduledTestId}, status=${finalStatus}`);
    } catch (err: any) {
      this.logger.error(`ScheduledTest execution failed: ${scheduledTestId}: ${err.message}`);

      await this.runRepo.update(scheduledTestRunId, {
        status: 'FAILED',
        errorMessage: err.message,
        completedAt: new Date(),
      });

      await this.testRepo.update(scheduledTestId, {
        lastRunAt: new Date(),
        lastRunStatus: 'FAILED' as any,
        nextRunAt: this.computeNextRun(test.cronExpression),
      });
    }
  }

  private computeNextRun(cronExpression: string): Date {
    try {
      return CronExpressionParser.parse(cronExpression).next().toDate();
    } catch {
      const d = new Date();
      d.setHours(d.getHours() + 1, 0, 0, 0);
      return d;
    }
  }
}
