import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MoveDocumentCommand } from './move-document.command';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(MoveDocumentCommand)
export class MoveDocumentHandler implements ICommandHandler<MoveDocumentCommand> {
  constructor(
    private readonly documentService: DocumentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: MoveDocumentCommand) {
    const doc = await this.documentService.moveToFolder(command.id, command.folderId);

    await this.activityService.log({
      documentId: command.id,
      action: 'MOVED',
      userId: command.userId,
      details: { targetFolderId: command.folderId },
    });

    return doc;
  }
}
