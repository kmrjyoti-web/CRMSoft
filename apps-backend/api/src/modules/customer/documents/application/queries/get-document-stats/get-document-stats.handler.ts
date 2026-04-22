import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDocumentStatsQuery } from './get-document-stats.query';
import { DocumentService } from '../../../services/document.service';

@QueryHandler(GetDocumentStatsQuery)
export class GetDocumentStatsHandler implements IQueryHandler<GetDocumentStatsQuery> {
    private readonly logger = new Logger(GetDocumentStatsHandler.name);

  constructor(private readonly documentService: DocumentService) {}

  async execute(query: GetDocumentStatsQuery) {
    try {
      return this.documentService.getStats(query.userId);
    } catch (error) {
      this.logger.error(`GetDocumentStatsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
