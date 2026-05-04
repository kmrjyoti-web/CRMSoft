import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ListListingsQuery } from './list-listings.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(ListListingsQuery)
@Injectable()
export class ListListingsHandler implements IQueryHandler<ListListingsQuery> {
    private readonly logger = new Logger(ListListingsHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: ListListingsQuery) {
    try {
      const where: Record<string, any> = {
        tenantId: query.tenantId,
        isDeleted: false,
      };

      if (query.status) where.status = query.status;
      if (query.listingType) where.listingType = query.listingType;
      if (query.categoryId) where.categoryId = query.categoryId;
      if (query.authorId) where.authorId = query.authorId;
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const skip = (query.page - 1) * query.limit;

      const [data, total] = await Promise.all([
        this.mktPrisma.client.mktListing.findMany({
          where,
          skip,
          take: query.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            priceTiers: { take: 3 },
            _count: { select: { reviews: true, enquiries: true } },
          },
        }),
        this.mktPrisma.client.mktListing.count({ where }),
      ]);

      return {
        data,
        meta: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
        },
      };
    } catch (error) {
      this.logger.error(`ListListingsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
