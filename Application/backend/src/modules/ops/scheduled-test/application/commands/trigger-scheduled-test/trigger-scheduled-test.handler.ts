import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TriggerScheduledTestCommand } from './trigger-scheduled-test.command';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';
import {
  SCHEDULED_TEST_RUN_REPOSITORY,
  IScheduledTestRunRepository,
} from '../../../infrastructure/repositories/scheduled-test-run.repository';
import { SCHEDULED_TEST_QUEUE } from '../../jobs/scheduled-test.processor';

@CommandHandler(TriggerScheduledTestCommand)
export class TriggerScheduledTestHandler implements ICommandHandler<TriggerScheduledTestCommand> {
  private readonly logger = new Logger(TriggerScheduledTestHandler.name);

  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly repo: IScheduledTestRepository,
    @Inject(SCHEDULED_TEST_RUN_REPOSITORY)
    private readonly runRepo: IScheduledTestRunRepository,
    @InjectQueue(SCHEDULED_TEST_QUEUE)
    private readonly queue: Queue,
  ) {}

  async execute(cmd: TriggerScheduledTestCommand): Promise<{ runId: string }> {
    const test = await this.repo.findById(cmd.id);
    if (!test || test.tenantId !== cmd.tenantId) {
      throw new NotFoundException('Scheduled test not found');
    }

    const run = await this.runRepo.create({
      scheduledTestId: test.id,
      status: 'QUEUED',
    });

    await this.queue.add(
      'EXECUTE_SCHEDULED_TEST',
      { scheduledTestId: test.id, scheduledTestRunId: run.id, triggeredBy: cmd.userId },
      { attempts: 1, removeOnComplete: 20, removeOnFail: 20 },
    );

    this.logger.log(`ScheduledTest manually triggered: ${test.id} → run=${run.id}`);
    return { runId: run.id };
  }
}
