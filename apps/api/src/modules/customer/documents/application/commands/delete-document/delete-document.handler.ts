import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DeleteDocumentCommand } from './delete-document.command';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(DeleteDocumentCommand)
export class DeleteDocumentHandler implements ICommandHandler<DeleteDocumentCommand> {
    private readonly logger = new Logger(DeleteDocumentHandler.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: DeleteDocumentCommand) {
    try {
      await this.documentService.softDelete(command.id);

      await this.activityService.log({
        documentId: command.id,
        action: 'DELETED',
        userId: command.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`DeleteDocumentHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
