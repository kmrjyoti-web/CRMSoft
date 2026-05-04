import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RevokeShareLinkCommand } from './revoke-share-link.command';
import { ShareLinkService } from '../../../services/share-link.service';

@CommandHandler(RevokeShareLinkCommand)
export class RevokeShareLinkHandler implements ICommandHandler<RevokeShareLinkCommand> {
    private readonly logger = new Logger(RevokeShareLinkHandler.name);

  constructor(private readonly shareLinkService: ShareLinkService) {}

  async execute(command: RevokeShareLinkCommand) {
    try {
      await this.shareLinkService.revokeLink(command.linkId, command.userId);
      return { success: true };
    } catch (error) {
      this.logger.error(`RevokeShareLinkHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
