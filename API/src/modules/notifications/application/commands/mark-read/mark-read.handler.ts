import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkReadCommand } from './mark-read.command';
import { NotificationCoreService } from '../../../services/notification-core.service';

@CommandHandler(MarkReadCommand)
export class MarkReadHandler implements ICommandHandler<MarkReadCommand> {
  constructor(private readonly notificationCore: NotificationCoreService) {}

  async execute(command: MarkReadCommand) {
    return this.notificationCore.markRead(command.notificationId, command.userId);
  }
}
