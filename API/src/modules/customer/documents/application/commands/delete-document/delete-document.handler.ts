import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteDocumentCommand } from './delete-document.command';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(DeleteDocumentCommand)
export class DeleteDocumentHandler implements ICommandHandler<DeleteDocumentCommand> {
  constructor(
    private readonly documentService: DocumentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: DeleteDocumentCommand) {
    await this.documentService.softDelete(command.id);

    await this.activityService.log({
      documentId: command.id,
      action: 'DELETED',
      userId: command.userId,
    });

    return { success: true };
  }
}
