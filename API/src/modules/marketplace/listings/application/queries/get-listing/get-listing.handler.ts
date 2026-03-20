import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetListingQuery } from './get-listing.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetListingQuery)
@Injectable()
export class GetListingHandler implements IQueryHandler<GetListingQuery> {
  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetListingQuery) {
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
  }
}
