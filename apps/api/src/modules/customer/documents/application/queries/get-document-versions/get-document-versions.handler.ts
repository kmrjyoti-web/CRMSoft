import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDocumentVersionsQuery } from './get-document-versions.query';
import { DocumentService } from '../../../services/document.service';

@QueryHandler(GetDocumentVersionsQuery)
export class GetDocumentVersionsHandler implements IQueryHandler<GetDocumentVersionsQuery> {
    private readonly logger = new Logger(GetDocumentVersionsHandler.name);

  constructor(private readonly documentService: DocumentService) {}

  async execute(query: GetDocumentVersionsQuery) {
    try {
      return this.documentService.getVersions(query.documentId);
    } catch (error) {
      this.logger.error(`GetDocumentVersionsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
