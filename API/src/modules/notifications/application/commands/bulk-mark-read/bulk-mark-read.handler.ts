import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkMarkReadCommand } from './bulk-mark-read.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(BulkMarkReadCommand)
export class BulkMarkReadHandler implements ICommandHandler<BulkMarkReadCommand> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: BulkMarkReadCommand) {
    return this.notificationCore.bulkMarkRead(command.notificationIds, command.userId);
  }
}
