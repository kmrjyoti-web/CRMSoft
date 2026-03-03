import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ResolveConversationCommand } from './resolve-conversation.command';
import { WaConversationService } from '../../../services/wa-conversation.service';

@CommandHandler(ResolveConversationCommand)
export class ResolveConversationHandler implements ICommandHandler<ResolveConversationCommand> {
  private readonly logger = new Logger(ResolveConversationHandler.name);

  constructor(private readonly waConversationService: WaConversationService) {}

  async execute(command: ResolveConversationCommand): Promise<void> {
    await this.waConversationService.resolve(command.conversationId);

    this.logger.log(
      `Conversation ${command.conversationId} resolved by user ${command.userId}`,
    );
  }
}
