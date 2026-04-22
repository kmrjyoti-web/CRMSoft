import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AssignConversationCommand } from './assign-conversation.command';
import { WaConversationService } from '../../../services/wa-conversation.service';

@CommandHandler(AssignConversationCommand)
export class AssignConversationHandler implements ICommandHandler<AssignConversationCommand> {
  private readonly logger = new Logger(AssignConversationHandler.name);

  constructor(private readonly conversationService: WaConversationService) {}

  async execute(cmd: AssignConversationCommand) {
    try {
      const result = await this.conversationService.assign(cmd.conversationId, cmd.assignToUserId);
      this.logger.log(`Conversation ${cmd.conversationId} assigned to ${cmd.assignToUserId} by user ${cmd.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`AssignConversationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
