import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DetachDocumentCommand } from './detach-document.command';
import { AttachmentService } from '../../../services/attachment.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(DetachDocumentCommand)
export class DetachDocumentHandler implements ICommandHandler<DetachDocumentCommand> {
    private readonly logger = new Logger(DetachDocumentHandler.name);

  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: DetachDocumentCommand) {
    try {
      await this.attachmentService.detachDocument(command.documentId, command.entityType, command.entityId);

      await this.activityService.log({
        documentId: command.documentId,
        action: 'DETACHED',
        userId: command.userId,
        details: { entityType: command.entityType, entityId: command.entityId },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`DetachDocumentHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
