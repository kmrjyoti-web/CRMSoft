import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@core/prisma/prisma.service';
import { TestType } from '@prisma/platform-client';
import { TestOrchestratorService } from '../services/test-orchestrator.service';

export const TEST_RUNNER_QUEUE = 'ops-test-runner';

export interface TestRunJobData {
  testRunId: string;
}

@Processor(TEST_RUNNER_QUEUE)
@Injectable()
export class TestRunProcessor {
  private readonly logger = new Logger(TestRunProcessor.name);

  constructor(
    private readonly orchestrator: TestOrchestratorService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('RUN_TESTS')
  async handleRunTests(job: Job<TestRunJobData>): Promise<void> {
    const { testRunId } = job.data;

    const testRun = await this.prisma.platform.testRun.findUnique({ where: { id: testRunId } });
    if (!testRun) throw new Error(`TestRun not found: ${testRunId}`);

    this.logger.log(`Processing TestRun: ${testRunId}`);

    await this.prisma.platform.testRun.update({
      where: { id: testRunId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      await this.orchestrator.runAll(
        testRunId,
        (testRun.testTypes as string[]).map(t => t as TestType),
        {
          targetModules: testRun.targetModules?.length ? testRun.targetModules : undefined,
        },
      );
    } catch (error: any) {
      this.logger.error(`TestRun ${testRunId} failed: ${error.message}`);
      await this.prisma.platform.testRun.update({
        where: { id: testRunId },
        data: {
          status: 'FAILED',
          currentPhase: `Error: ${error.message?.substring(0, 200)}`,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }
}
