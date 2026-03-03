import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetEntityDocumentsQuery } from './get-entity-documents.query';
import { AttachmentService } from '../../../services/attachment.service';

@QueryHandler(GetEntityDocumentsQuery)
export class GetEntityDocumentsHandler implements IQueryHandler<GetEntityDocumentsQuery> {
  constructor(private readonly attachmentService: AttachmentService) {}

  async execute(query: GetEntityDocumentsQuery) {
    return this.attachmentService.getEntityDocuments(query.entityType, query.entityId, query.page, query.limit);
  }
}
