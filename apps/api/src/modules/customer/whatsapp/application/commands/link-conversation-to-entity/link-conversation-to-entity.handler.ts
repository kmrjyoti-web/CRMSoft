import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { LinkConversationToEntityCommand } from './link-conversation-to-entity.command';
import { WaEntityLinkerService } from '../../../services/wa-entity-linker.service';

@CommandHandler(LinkConversationToEntityCommand)
export class LinkConversationToEntityHandler implements ICommandHandler<LinkConversationToEntityCommand> {
  private readonly logger = new Logger(LinkConversationToEntityHandler.name);

  constructor(private readonly waEntityLinkerService: WaEntityLinkerService) {}

  async execute(command: LinkConversationToEntityCommand): Promise<void> {
    try {
      await this.waEntityLinkerService.manualLink(
        command.conversationId,
        command.entityType,
        command.entityId,
      );

      this.logger.log(
        `Conversation ${command.conversationId} linked to ${command.entityType}:${command.entityId} by user ${command.userId}`,
      );
    } catch (error) {
      this.logger.error(`LinkConversationToEntityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
