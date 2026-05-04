import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { MarkAllReadCommand } from './mark-all-read.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(MarkAllReadCommand)
export class MarkAllReadHandler implements ICommandHandler<MarkAllReadCommand> {
    private readonly logger = new Logger(MarkAllReadHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: MarkAllReadCommand) {
    try {
      return this.notificationCore.markAllRead(command.userId, command.category);
    } catch (error) {
      this.logger.error(`MarkAllReadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
