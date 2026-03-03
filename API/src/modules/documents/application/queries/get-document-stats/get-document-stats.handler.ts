import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDocumentStatsQuery } from './get-document-stats.query';
import { DocumentService } from '../../../services/document.service';

@QueryHandler(GetDocumentStatsQuery)
export class GetDocumentStatsHandler implements IQueryHandler<GetDocumentStatsQuery> {
  constructor(private readonly documentService: DocumentService) {}

  async execute(query: GetDocumentStatsQuery) {
    return this.documentService.getStats(query.userId);
  }
}
