import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateShareLinkCommand } from './create-share-link.command';
import { ShareLinkService } from '../../../services/share-link.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(CreateShareLinkCommand)
export class CreateShareLinkHandler implements ICommandHandler<CreateShareLinkCommand> {
  constructor(
    private readonly shareLinkService: ShareLinkService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: CreateShareLinkCommand) {
    const link = await this.shareLinkService.createLink({
      documentId: command.documentId,
      access: command.access,
      password: command.password,
      expiresAt: command.expiresAt,
      maxViews: command.maxViews,
      createdById: command.userId,
    });

    await this.activityService.log({
      documentId: command.documentId,
      action: 'SHARED',
      userId: command.userId,
      details: { shareLinkId: link.id, access: link.access },
    });

    return link;
  }
}
