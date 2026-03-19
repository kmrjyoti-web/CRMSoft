import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DismissNotificationCommand } from './dismiss-notification.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(DismissNotificationCommand)
export class DismissNotificationHandler implements ICommandHandler<DismissNotificationCommand> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: DismissNotificationCommand) {
    return this.notificationCore.dismiss(command.notificationId, command.userId);
  }
}
