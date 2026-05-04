import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendNotificationCommand } from './send-notification.command';
import { ChannelRouterService } from '../../../services/channel-router.service';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
    private readonly logger = new Logger(SendNotificationHandler.name);

  constructor(private readonly channelRouter: ChannelRouterService) {}

  async execute(command: SendNotificationCommand) {
    try {
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
    } catch (error) {
      this.logger.error(`SendNotificationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
