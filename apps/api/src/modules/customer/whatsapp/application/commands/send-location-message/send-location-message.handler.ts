import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendLocationMessageCommand } from './send-location-message.command';
import { WaMessageSenderService } from '../../../services/wa-message-sender.service';

@CommandHandler(SendLocationMessageCommand)
export class SendLocationMessageHandler implements ICommandHandler<SendLocationMessageCommand> {
  private readonly logger = new Logger(SendLocationMessageHandler.name);

  constructor(private readonly messageSender: WaMessageSenderService) {}

  async execute(cmd: SendLocationMessageCommand) {
    try {
      const result = await this.messageSender.sendLocation(
        cmd.wabaId,
        cmd.conversationId,
        cmd.lat,
        cmd.lng,
        cmd.name,
        cmd.address,
        cmd.userId,
      );
      this.logger.log(`Location message sent in conversation ${cmd.conversationId} by user ${cmd.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`SendLocationMessageHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
