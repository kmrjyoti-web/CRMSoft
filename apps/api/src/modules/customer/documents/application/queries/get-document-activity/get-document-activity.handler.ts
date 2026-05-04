import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetDocumentActivityQuery } from './get-document-activity.query';
import { DocumentActivityService } from '../../../services/document-activity.service';

@QueryHandler(GetDocumentActivityQuery)
export class GetDocumentActivityHandler implements IQueryHandler<GetDocumentActivityQuery> {
    private readonly logger = new Logger(GetDocumentActivityHandler.name);

  constructor(private readonly activityService: DocumentActivityService) {}

  async execute(query: GetDocumentActivityQuery) {
    try {
      return this.activityService.getDocumentActivity(query.documentId, query.page, query.limit);
    } catch (error) {
      this.logger.error(`GetDocumentActivityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
