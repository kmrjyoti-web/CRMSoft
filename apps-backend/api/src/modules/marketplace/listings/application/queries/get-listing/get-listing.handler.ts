import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { GetListingQuery } from './get-listing.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetListingQuery)
@Injectable()
export class GetListingHandler implements IQueryHandler<GetListingQuery> {
    private readonly logger = new Logger(GetListingHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetListingQuery) {
    try {
      const listing = await this.mktPrisma.client.mktListing.findFirst({
        where: { id: query.id, tenantId: query.tenantId, isDeleted: false },
        include: {
          priceTiers: true,
          analyticsSummary: true,
          _count: {
            select: { reviews: true, enquiries: true },
          },
        },
      });

      if (!listing) {
        throw new NotFoundException(`Listing ${query.id} not found`);
      }

      return listing;
    } catch (error) {
      this.logger.error(`GetListingHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
