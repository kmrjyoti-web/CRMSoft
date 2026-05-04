import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ListOffersQuery } from './list-offers.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(ListOffersQuery)
@Injectable()
export class ListOffersHandler implements IQueryHandler<ListOffersQuery> {
    private readonly logger = new Logger(ListOffersHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: ListOffersQuery) {
    try {
      const where: Record<string, any> = { tenantId: query.tenantId, isDeleted: false };
      if (query.status) where.status = query.status;
      if (query.offerType) where.offerType = query.offerType;
      if (query.authorId) where.authorId = query.authorId;

      const skip = (query.page - 1) * query.limit;
      const [data, total] = await Promise.all([
        this.mktPrisma.client.mktOffer.findMany({
          where,
          skip,
          take: query.limit,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { redemptions: true } } },
        }),
        this.mktPrisma.client.mktOffer.count({ where }),
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
      this.logger.error(`ListOffersHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
