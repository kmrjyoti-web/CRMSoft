import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { BulkDismissCommand } from './bulk-dismiss.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(BulkDismissCommand)
export class BulkDismissHandler implements ICommandHandler<BulkDismissCommand> {
    private readonly logger = new Logger(BulkDismissHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: BulkDismissCommand) {
    try {
      return this.notificationCore.bulkDismiss(command.notificationIds, command.userId);
    } catch (error) {
      this.logger.error(`BulkDismissHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
