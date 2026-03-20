import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ListReviewsQuery } from './list-reviews.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(ListReviewsQuery)
@Injectable()
export class ListReviewsHandler implements IQueryHandler<ListReviewsQuery> {
  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: ListReviewsQuery) {
    const where: Record<string, any> = { tenantId: query.tenantId, isDeleted: false };
    if (query.listingId) where.listingId = query.listingId;
    if (query.reviewerId) where.reviewerId = query.reviewerId;
    if (query.status) where.status = query.status;

    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.mktPrisma.client.mktReview.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.mktPrisma.client.mktReview.count({ where }),
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
  }
}
