import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from './send-notification.command';
import { ChannelRouterService } from '../../../services/channel-router.service';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  constructor(private readonly channelRouter: ChannelRouterService) {}

  async execute(command: SendNotificationCommand) {
    return this.channelRouter.send({
      templateName: command.templateName,
      recipientId: command.recipientId,
      senderId: command.senderId,
      variables: command.variables,
      entityType: command.entityType,
      entityId: command.entityId,
      priority: command.priority,
      groupKey: command.groupKey,
      channelOverrides: command.channelOverrides,
    });
  }
}
