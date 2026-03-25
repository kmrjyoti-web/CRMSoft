import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateTestRunCommand } from './create-test-run.command';
import { TEST_RUN_REPOSITORY, ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';
import { TEST_RUNNER_QUEUE } from '../../jobs/test-run.processor';

const MAX_CONCURRENT_RUNS = 2;

@CommandHandler(CreateTestRunCommand)
export class CreateTestRunHandler implements ICommandHandler<CreateTestRunCommand> {
  private readonly logger = new Logger(CreateTestRunHandler.name);

  constructor(
    @Inject(TEST_RUN_REPOSITORY)
    private readonly repo: ITestRunRepository,
    @InjectQueue(TEST_RUNNER_QUEUE)
    private readonly queue: Queue,
  ) {}

  async execute(cmd: CreateTestRunCommand): Promise<{ id: string; status: string }> {
    const { tenantId, userId, testTypes, targetModules, runType, testEnvId } = cmd;

    const running = await this.repo.countRunning(tenantId);
    if (running >= MAX_CONCURRENT_RUNS) {
      throw new BadRequestException(
        `Maximum ${MAX_CONCURRENT_RUNS} concurrent test runs per tenant. Wait for an existing run to complete.`,
      );
    }

    const testRun = await this.repo.create({
      tenantId,
      testEnvId,
      runType,
      testTypes: testTypes.length > 0 ? testTypes : ['UNIT', 'FUNCTIONAL', 'SMOKE', 'INTEGRATION', 'ARCHITECTURE', 'PENETRATION'],
      targetModules: targetModules ?? [],
      createdById: userId,
    });

    await this.queue.add(
      'RUN_TESTS',
      { testRunId: testRun.id },
      { attempts: 1, removeOnComplete: 20, removeOnFail: 20 },
    );

    this.logger.log(`TestRun queued: ${testRun.id} (type=${runType}, tests=${testRun.testTypes.join(',')})`);
    return { id: testRun.id, status: 'QUEUED' };
  }
}
