import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeShareLinkCommand } from './revoke-share-link.command';
import { ShareLinkService } from '../../../services/share-link.service';

@CommandHandler(RevokeShareLinkCommand)
export class RevokeShareLinkHandler implements ICommandHandler<RevokeShareLinkCommand> {
  constructor(private readonly shareLinkService: ShareLinkService) {}

  async execute(command: RevokeShareLinkCommand) {
    await this.shareLinkService.revokeLink(command.linkId, command.userId);
    return { success: true };
  }
}
