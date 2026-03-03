import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDocumentVersionsQuery } from './get-document-versions.query';
import { DocumentService } from '../../../services/document.service';

@QueryHandler(GetDocumentVersionsQuery)
export class GetDocumentVersionsHandler implements IQueryHandler<GetDocumentVersionsQuery> {
  constructor(private readonly documentService: DocumentService) {}

  async execute(query: GetDocumentVersionsQuery) {
    return this.documentService.getVersions(query.documentId);
  }
}
