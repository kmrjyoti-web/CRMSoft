import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDocumentByIdQuery } from './get-document-by-id.query';
import { DocumentService } from '../../../services/document.service';

@QueryHandler(GetDocumentByIdQuery)
export class GetDocumentByIdHandler implements IQueryHandler<GetDocumentByIdQuery> {
  constructor(private readonly documentService: DocumentService) {}

  async execute(query: GetDocumentByIdQuery) {
    return this.documentService.getById(query.id);
  }
}
