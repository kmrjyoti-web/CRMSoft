import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendTemplateMessageCommand } from './send-template-message.command';
import { WaMessageSenderService } from '../../../services/wa-message-sender.service';

@CommandHandler(SendTemplateMessageCommand)
export class SendTemplateMessageHandler implements ICommandHandler<SendTemplateMessageCommand> {
  private readonly logger = new Logger(SendTemplateMessageHandler.name);

  constructor(private readonly messageSender: WaMessageSenderService) {}

  async execute(cmd: SendTemplateMessageCommand) {
    try {
      const result = await this.messageSender.sendTemplate(
        cmd.wabaId,
        cmd.conversationId,
        cmd.templateId,
        cmd.variables,
        cmd.userId,
      );
      this.logger.log(`Template message sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`SendTemplateMessageHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
