import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GetShareLinkQuery } from './get-share-link.query';

@QueryHandler(GetShareLinkQuery)
@Injectable()
export class GetShareLinkHandler implements IQueryHandler<GetShareLinkQuery> {
    private readonly logger = new Logger(GetShareLinkHandler.name);

  async execute(query: GetShareLinkQuery) {
    try {
      const { entityType, entityId } = query;
      const baseUrl = `https://marketplace.crmsoft.in/${entityType}/${entityId}`;

      return {
        webUrl: baseUrl,
        deepLink: `crmsoft://marketplace/${entityType}/${entityId}`,
        whatsappText: `Check out this ${entityType} on CRMSoft Marketplace: ${baseUrl}`,
        copyText: baseUrl,
      };
    } catch (error) {
      this.logger.error(`GetShareLinkHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
