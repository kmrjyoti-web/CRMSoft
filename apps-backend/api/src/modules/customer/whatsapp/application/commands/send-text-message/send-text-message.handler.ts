import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendTextMessageCommand } from './send-text-message.command';
import { WaMessageSenderService } from '../../../services/wa-message-sender.service';

@CommandHandler(SendTextMessageCommand)
export class SendTextMessageHandler implements ICommandHandler<SendTextMessageCommand> {
  private readonly logger = new Logger(SendTextMessageHandler.name);

  constructor(private readonly messageSender: WaMessageSenderService) {}

  async execute(cmd: SendTextMessageCommand) {
    try {
      const result = await this.messageSender.sendText(cmd.wabaId, cmd.conversationId, cmd.text, cmd.userId);
      this.logger.log(`Text message sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`SendTextMessageHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
