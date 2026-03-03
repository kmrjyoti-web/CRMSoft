import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkAllReadCommand } from './mark-all-read.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(MarkAllReadCommand)
export class MarkAllReadHandler implements ICommandHandler<MarkAllReadCommand> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: MarkAllReadCommand) {
    return this.notificationCore.markAllRead(command.userId, command.category);
  }
}
