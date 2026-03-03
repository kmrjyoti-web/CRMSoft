import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDocumentActivityQuery } from './get-document-activity.query';
import { DocumentActivityService } from '../../../services/document-activity.service';

@QueryHandler(GetDocumentActivityQuery)
export class GetDocumentActivityHandler implements IQueryHandler<GetDocumentActivityQuery> {
  constructor(private readonly activityService: DocumentActivityService) {}

  async execute(query: GetDocumentActivityQuery) {
    return this.activityService.getDocumentActivity(query.documentId, query.page, query.limit);
  }
}
