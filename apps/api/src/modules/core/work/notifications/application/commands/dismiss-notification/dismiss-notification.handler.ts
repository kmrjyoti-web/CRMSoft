import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DismissNotificationCommand } from './dismiss-notification.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(DismissNotificationCommand)
export class DismissNotificationHandler implements ICommandHandler<DismissNotificationCommand> {
    private readonly logger = new Logger(DismissNotificationHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: DismissNotificationCommand) {
    try {
      return this.notificationCore.dismiss(command.notificationId, command.userId);
    } catch (error) {
      this.logger.error(`DismissNotificationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
