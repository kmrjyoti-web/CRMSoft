import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetShareLinkQuery } from './get-share-link.query';
import { ShareLinkService } from '../../../services/share-link.service';

@QueryHandler(GetShareLinkQuery)
export class GetShareLinkHandler implements IQueryHandler<GetShareLinkQuery> {
    private readonly logger = new Logger(GetShareLinkHandler.name);

  constructor(private readonly shareLinkService: ShareLinkService) {}

  async execute(query: GetShareLinkQuery) {
    try {
      return this.shareLinkService.accessLink(query.token, query.password);
    } catch (error) {
      this.logger.error(`GetShareLinkHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
