import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';
import { CreateScheduledTestCommand } from './create-scheduled-test.command';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';

@CommandHandler(CreateScheduledTestCommand)
export class CreateScheduledTestHandler implements ICommandHandler<CreateScheduledTestCommand> {
  private readonly logger = new Logger(CreateScheduledTestHandler.name);

  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly repo: IScheduledTestRepository,
  ) {}

  async execute(cmd: CreateScheduledTestCommand): Promise<Record<string, unknown>> {
    const { tenantId, userId, name, description, cronExpression, targetModules, testTypes, dbSourceType } = cmd;

    // Compute next run time from cron expression
    const nextRunAt = this.computeNextRun(cronExpression);

    const test = await this.repo.create({
      tenantId,
      name,
      description,
      cronExpression,
      targetModules,
      testTypes: testTypes.length > 0 ? testTypes : ['UNIT', 'FUNCTIONAL', 'SMOKE'],
      dbSourceType: dbSourceType ?? 'BACKUP_RESTORE',
      createdById: userId,
      nextRunAt,
    });

    this.logger.log(`ScheduledTest created: ${test.id} (cron=${cronExpression}, nextRun=${nextRunAt})`);
    return test;
  }

  private computeNextRun(cronExpression: string): Date {
    try {
      const interval = CronExpressionParser.parse(cronExpression);
      return interval.next().toDate();
    } catch {
      // Default: next hour
      const d = new Date();
      d.setHours(d.getHours() + 1, 0, 0, 0);
      return d;
    }
  }
}
