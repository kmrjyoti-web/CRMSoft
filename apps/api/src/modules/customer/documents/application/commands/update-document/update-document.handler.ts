import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateDocumentCommand } from './update-document.command';
import { DocumentService } from '../../../services/document.service';
import { DocumentActivityService } from '../../../services/document-activity.service';

@CommandHandler(UpdateDocumentCommand)
export class UpdateDocumentHandler implements ICommandHandler<UpdateDocumentCommand> {
    private readonly logger = new Logger(UpdateDocumentHandler.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly activityService: DocumentActivityService,
  ) {}

  async execute(command: UpdateDocumentCommand) {
    try {
      const doc = await this.documentService.updateDocument(command.id, {
        description: command.description,
        category: command.category,
        tags: command.tags,
      });

      await this.activityService.log({
        documentId: command.id,
        action: 'UPDATED',
        userId: command.userId,
        details: { description: command.description, category: command.category, tags: command.tags },
      });

      return doc;
    } catch (error) {
      this.logger.error(`UpdateDocumentHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
