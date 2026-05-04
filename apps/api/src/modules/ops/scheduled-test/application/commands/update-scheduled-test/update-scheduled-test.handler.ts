import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';
import { UpdateScheduledTestCommand } from './update-scheduled-test.command';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';

@CommandHandler(UpdateScheduledTestCommand)
export class UpdateScheduledTestHandler implements ICommandHandler<UpdateScheduledTestCommand> {
  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly repo: IScheduledTestRepository,
  ) {}

  async execute(cmd: UpdateScheduledTestCommand): Promise<Record<string, unknown>> {
    const existing = await this.repo.findById(cmd.id);
    if (!existing || existing.tenantId !== cmd.tenantId) {
      throw new NotFoundException('Scheduled test not found');
    }

    const updates: any = {};
    if (cmd.name !== undefined) updates.name = cmd.name;
    if (cmd.description !== undefined) updates.description = cmd.description;
    if (cmd.cronExpression !== undefined) {
      updates.cronExpression = cmd.cronExpression;
      updates.nextRunAt = this.computeNextRun(cmd.cronExpression);
    }
    if (cmd.targetModules !== undefined) updates.targetModules = cmd.targetModules;
    if (cmd.testTypes !== undefined) updates.testTypes = cmd.testTypes;
    if (cmd.dbSourceType !== undefined) updates.dbSourceType = cmd.dbSourceType;
    if (cmd.isActive !== undefined) updates.isActive = cmd.isActive;

    return this.repo.update(cmd.id, updates);
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
