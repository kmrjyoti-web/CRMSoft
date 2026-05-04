import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RecalculateUsageCommand } from './recalculate-usage.command';
import { UsageTrackerService } from '../../../services/usage-tracker.service';

@CommandHandler(RecalculateUsageCommand)
export class RecalculateUsageHandler implements ICommandHandler<RecalculateUsageCommand> {
  private readonly logger = new Logger(RecalculateUsageHandler.name);

  constructor(
    private readonly usageTracker: UsageTrackerService,
  ) {}

  async execute(command: RecalculateUsageCommand) {
    try {
      await this.usageTracker.recalculate(command.tenantId);

      this.logger.log(`Usage recalculated for tenant ${command.tenantId}`);
    } catch (error) {
      this.logger.error(`RecalculateUsageHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
