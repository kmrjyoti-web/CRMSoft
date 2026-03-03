import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendInteractiveMessageCommand } from './send-interactive-message.command';
import { WaMessageSenderService } from '../../../services/wa-message-sender.service';

@CommandHandler(SendInteractiveMessageCommand)
export class SendInteractiveMessageHandler implements ICommandHandler<SendInteractiveMessageCommand> {
  private readonly logger = new Logger(SendInteractiveMessageHandler.name);

  constructor(private readonly messageSender: WaMessageSenderService) {}

  async execute(cmd: SendInteractiveMessageCommand) {
    const result = await this.messageSender.sendInteractive(
      cmd.wabaId,
      cmd.conversationId,
      cmd.interactiveType,
      cmd.interactiveData,
      cmd.userId,
    );
    this.logger.log(`Interactive message (${cmd.interactiveType}) sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
    return result;
  }
}
