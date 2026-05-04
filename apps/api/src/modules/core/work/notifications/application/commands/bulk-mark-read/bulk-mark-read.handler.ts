import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { BulkMarkReadCommand } from './bulk-mark-read.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(BulkMarkReadCommand)
export class BulkMarkReadHandler implements ICommandHandler<BulkMarkReadCommand> {
    private readonly logger = new Logger(BulkMarkReadHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: BulkMarkReadCommand) {
    try {
      return this.notificationCore.bulkMarkRead(command.notificationIds, command.userId);
    } catch (error) {
      this.logger.error(`BulkMarkReadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
