import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetShareLinkQuery } from './get-share-link.query';

@QueryHandler(GetShareLinkQuery)
@Injectable()
export class GetShareLinkHandler implements IQueryHandler<GetShareLinkQuery> {
  async execute(query: GetShareLinkQuery) {
    const { entityType, entityId } = query;
    const baseUrl = `https://marketplace.crmsoft.in/${entityType}/${entityId}`;

    return {
      webUrl: baseUrl,
      deepLink: `crmsoft://marketplace/${entityType}/${entityId}`,
      whatsappText: `Check out this ${entityType} on CRMSoft Marketplace: ${baseUrl}`,
      copyText: baseUrl,
    };
  }
}
