import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../infrastructure/repositories/scheduled-test.repository';
import {
  SCHEDULED_TEST_RUN_REPOSITORY,
  IScheduledTestRunRepository,
} from '../../infrastructure/repositories/scheduled-test-run.repository';
import { SCHEDULED_TEST_QUEUE } from './scheduled-test.processor';

/**
 * Runs every minute.
 * Finds all ScheduledTests where nextRunAt <= now and dispatches them to the BullMQ queue.
 */
@Injectable()
export class ScheduledTestCron {
  private readonly logger = new Logger(ScheduledTestCron.name);

  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly testRepo: IScheduledTestRepository,
    @Inject(SCHEDULED_TEST_RUN_REPOSITORY)
    private readonly runRepo: IScheduledTestRunRepository,
    @InjectQueue(SCHEDULED_TEST_QUEUE)
    private readonly queue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async dispatchDueTests(): Promise<void> {
    const dueTests = await this.testRepo.findDue();
    if (dueTests.length === 0) return;

    this.logger.log(`Dispatching ${dueTests.length} due scheduled test(s)`);

    for (const test of dueTests) {
      try {
        const run = await this.runRepo.create({
          scheduledTestId: test.id,
          status: 'QUEUED',
        });

        await this.queue.add(
          'EXECUTE_SCHEDULED_TEST',
          { scheduledTestId: test.id, scheduledTestRunId: run.id },
          { attempts: 1, removeOnComplete: 20, removeOnFail: 20 },
        );

        this.logger.log(`Dispatched scheduled test: ${test.name} (${test.id}) → run=${run.id}`);
      } catch (err: any) {
        this.logger.error(`Failed to dispatch scheduled test ${test.id}: ${err.message}`);
      }
    }
  }
}
