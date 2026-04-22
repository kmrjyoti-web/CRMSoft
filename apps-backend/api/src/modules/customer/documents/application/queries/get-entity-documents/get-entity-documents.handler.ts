import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetEntityDocumentsQuery } from './get-entity-documents.query';
import { AttachmentService } from '../../../services/attachment.service';

@QueryHandler(GetEntityDocumentsQuery)
export class GetEntityDocumentsHandler implements IQueryHandler<GetEntityDocumentsQuery> {
    private readonly logger = new Logger(GetEntityDocumentsHandler.name);

  constructor(private readonly attachmentService: AttachmentService) {}

  async execute(query: GetEntityDocumentsQuery) {
    try {
      return this.attachmentService.getEntityDocuments(query.entityType, query.entityId, query.page, query.limit);
    } catch (error) {
      this.logger.error(`GetEntityDocumentsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
