import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDocumentListQuery } from './get-document-list.query';
import { DocumentService } from '../../../services/document.service';

@QueryHandler(GetDocumentListQuery)
export class GetDocumentListHandler implements IQueryHandler<GetDocumentListQuery> {
    private readonly logger = new Logger(GetDocumentListHandler.name);

  constructor(private readonly documentService: DocumentService) {}

  async execute(query: GetDocumentListQuery) {
    try {
      return this.documentService.getList({
        page: query.page,
        limit: query.limit,
        search: query.search,
        category: query.category,
        storageType: query.storageType,
        folderId: query.folderId,
        uploadedById: query.uploadedById,
        tags: query.tags,
      });
    } catch (error) {
      this.logger.error(`GetDocumentListHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
