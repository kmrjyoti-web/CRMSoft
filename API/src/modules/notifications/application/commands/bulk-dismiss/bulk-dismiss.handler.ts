import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkDismissCommand } from './bulk-dismiss.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(BulkDismissCommand)
export class BulkDismissHandler implements ICommandHandler<BulkDismissCommand> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: BulkDismissCommand) {
    return this.notificationCore.bulkDismiss(command.notificationIds, command.userId);
  }
}
