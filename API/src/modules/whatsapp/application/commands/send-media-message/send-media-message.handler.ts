import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendMediaMessageCommand } from './send-media-message.command';
import { WaMessageSenderService } from '../../../services/wa-message-sender.service';

@CommandHandler(SendMediaMessageCommand)
export class SendMediaMessageHandler implements ICommandHandler<SendMediaMessageCommand> {
  private readonly logger = new Logger(SendMediaMessageHandler.name);

  constructor(private readonly messageSender: WaMessageSenderService) {}

  async execute(cmd: SendMediaMessageCommand) {
    const result = await this.messageSender.sendMedia(
      cmd.wabaId,
      cmd.conversationId,
      cmd.type,
      cmd.mediaUrl,
      cmd.caption,
      cmd.userId,
    );
    this.logger.log(`Media message (${cmd.type}) sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
    return result;
  }
}
