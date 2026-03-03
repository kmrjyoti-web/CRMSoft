import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDocumentListQuery } from './get-document-list.query';
import { DocumentService } from '../../../services/document.service';

@QueryHandler(GetDocumentListQuery)
export class GetDocumentListHandler implements IQueryHandler<GetDocumentListQuery> {
  constructor(private readonly documentService: DocumentService) {}

  async execute(query: GetDocumentListQuery) {
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
  }
}
