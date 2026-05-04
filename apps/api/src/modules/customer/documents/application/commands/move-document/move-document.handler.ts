import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { MoveDocumentCommand } from './move-document.command';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(MoveDocumentCommand)
export class MoveDocumentHandler implements ICommandHandler<MoveDocumentCommand> {
    private readonly logger = new Logger(MoveDocumentHandler.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: MoveDocumentCommand) {
    try {
      const doc = await this.documentService.moveToFolder(command.id, command.folderId);

      await this.activityService.log({
        documentId: command.id,
        action: 'MOVED',
        userId: command.userId,
        details: { targetFolderId: command.folderId },
      });

      return doc;
    } catch (error) {
      this.logger.error(`MoveDocumentHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
