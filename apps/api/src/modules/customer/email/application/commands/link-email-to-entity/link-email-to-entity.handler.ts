import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { LinkEmailToEntityCommand } from './link-email-to-entity.command';
import { EmailLinkerService } from '../../../services/email-linker.service';

@CommandHandler(LinkEmailToEntityCommand)
export class LinkEmailToEntityHandler implements ICommandHandler<LinkEmailToEntityCommand> {
  private readonly logger = new Logger(LinkEmailToEntityHandler.name);

  constructor(private readonly emailLinker: EmailLinkerService) {}

  async execute(cmd: LinkEmailToEntityCommand) {
    try {
      await this.emailLinker.manualLink(cmd.emailId, cmd.entityType, cmd.entityId);
      this.logger.log(`Email ${cmd.emailId} linked to ${cmd.entityType}:${cmd.entityId} by user ${cmd.userId}`);
    } catch (error) {
      this.logger.error(`LinkEmailToEntityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
