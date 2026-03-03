import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ReopenConversationCommand } from './reopen-conversation.command';
import { WaConversationService } from '../../../services/wa-conversation.service';

@CommandHandler(ReopenConversationCommand)
export class ReopenConversationHandler implements ICommandHandler<ReopenConversationCommand> {
  private readonly logger = new Logger(ReopenConversationHandler.name);

  constructor(private readonly waConversationService: WaConversationService) {}

  async execute(command: ReopenConversationCommand): Promise<void> {
    await this.waConversationService.reopen(command.conversationId);

    this.logger.log(`Conversation ${command.conversationId} reopened`);
  }
}
