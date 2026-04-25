import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDocumentByIdQuery } from './get-document-by-id.query';
import { DocumentService } from '../../../services/document.service';

@QueryHandler(GetDocumentByIdQuery)
export class GetDocumentByIdHandler implements IQueryHandler<GetDocumentByIdQuery> {
    private readonly logger = new Logger(GetDocumentByIdHandler.name);

  constructor(private readonly documentService: DocumentService) {}

  async execute(query: GetDocumentByIdQuery) {
    try {
      return this.documentService.getById(query.id);
    } catch (error) {
      this.logger.error(`GetDocumentByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
