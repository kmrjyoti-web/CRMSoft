import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetShareLinkQuery } from './get-share-link.query';
import { ShareLinkService } from '../../../services/share-link.service';

@QueryHandler(GetShareLinkQuery)
export class GetShareLinkHandler implements IQueryHandler<GetShareLinkQuery> {
  constructor(private readonly shareLinkService: ShareLinkService) {}

  async execute(query: GetShareLinkQuery) {
    return this.shareLinkService.accessLink(query.token, query.password);
  }
}
