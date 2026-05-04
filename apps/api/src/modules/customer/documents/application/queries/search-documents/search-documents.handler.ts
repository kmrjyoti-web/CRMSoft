import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SearchDocumentsQuery } from './search-documents.query';
import { DocumentSearchService } from '../../../services/search.service';

@QueryHandler(SearchDocumentsQuery)
export class SearchDocumentsHandler implements IQueryHandler<SearchDocumentsQuery> {
    private readonly logger = new Logger(SearchDocumentsHandler.name);

  constructor(private readonly searchService: DocumentSearchService) {}

  async execute(query: SearchDocumentsQuery) {
    try {
      return this.searchService.search({
        query: query.query,
        page: query.page,
        limit: query.limit,
        category: query.category,
        storageType: query.storageType,
        tags: query.tags,
        uploadedById: query.uploadedById,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        mimeType: query.mimeType,
        minSize: query.minSize,
        maxSize: query.maxSize,
      });
    } catch (error) {
      this.logger.error(`SearchDocumentsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
