import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DetachDocumentCommand } from './detach-document.command';
import { AttachmentService } from '../../../services/attachment.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(DetachDocumentCommand)
export class DetachDocumentHandler implements ICommandHandler<DetachDocumentCommand> {
  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: DetachDocumentCommand) {
    await this.attachmentService.detachDocument(command.documentId, command.entityType, command.entityId);

    await this.activityService.log({
      documentId: command.documentId,
      action: 'DETACHED',
      userId: command.userId,
      details: { entityType: command.entityType, entityId: command.entityId },
    });

    return { success: true };
  }
}
