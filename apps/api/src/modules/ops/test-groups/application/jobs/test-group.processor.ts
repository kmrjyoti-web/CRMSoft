import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@core/prisma/prisma.service';
import { TestGroupRunnerService } from '../services/test-group-runner.service';

export const TEST_GROUP_QUEUE = 'ops-test-groups';

export interface TestGroupJobData {
  executionId: string;
}

@Processor(TEST_GROUP_QUEUE)
@Injectable()
export class TestGroupProcessor {
  private readonly logger = new Logger(TestGroupProcessor.name);

  constructor(
    private readonly runner: TestGroupRunnerService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('RUN_TEST_GROUP')
  async handleRunTestGroup(job: Job<TestGroupJobData>): Promise<void> {
    const { executionId } = job.data;

    const execution = await this.prisma.platform.testGroupExecution.findUnique({
      where: { id: executionId },
      include: { testGroup: true },
    });

    if (!execution) throw new Error(`TestGroupExecution not found: ${executionId}`);

    this.logger.log(`Running TestGroup: ${execution.testGroup.name} (exec=${executionId})`);

    // For automated execution, use a service-level auth token from env
    const authToken = process.env.INTERNAL_API_TOKEN ?? 'internal-service-token';

    try {
      await this.runner.execute(executionId, execution.testGroup, authToken);
    } catch (error: any) {
      this.logger.error(`TestGroup execution failed: ${error.message}`);
      await this.prisma.platform.testGroupExecution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }
}
