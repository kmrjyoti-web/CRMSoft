import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { MarkReadCommand } from './mark-read.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(MarkReadCommand)
export class MarkReadHandler implements ICommandHandler<MarkReadCommand> {
    private readonly logger = new Logger(MarkReadHandler.name);

  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: MarkReadCommand) {
    try {
      return this.notificationCore.markRead(command.notificationId, command.userId);
    } catch (error) {
      this.logger.error(`MarkReadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
