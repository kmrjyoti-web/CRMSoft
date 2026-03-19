import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttachDocumentCommand } from './attach-document.command';
import { AttachmentService } from '../../../services/attachment.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(AttachDocumentCommand)
export class AttachDocumentHandler implements ICommandHandler<AttachDocumentCommand> {
  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: AttachDocumentCommand) {
    const result = await this.attachmentService.attachDocument(
      command.documentId, command.entityType, command.entityId, command.userId,
    );

    await this.activityService.log({
      documentId: command.documentId,
      action: 'ATTACHED',
      userId: command.userId,
      details: { entityType: command.entityType, entityId: command.entityId },
    });

    return result;
  }
}
