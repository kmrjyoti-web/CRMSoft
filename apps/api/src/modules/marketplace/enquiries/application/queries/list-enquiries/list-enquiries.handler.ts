import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ListEnquiriesQuery } from './list-enquiries.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(ListEnquiriesQuery)
@Injectable()
export class ListEnquiriesHandler implements IQueryHandler<ListEnquiriesQuery> {
    private readonly logger = new Logger(ListEnquiriesHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: ListEnquiriesQuery) {
    try {
      const where: Record<string, any> = { tenantId: query.tenantId, isDeleted: false };
      if (query.listingId) where.listingId = query.listingId;
      if (query.enquirerId) where.enquirerId = query.enquirerId;
      if (query.status) where.status = query.status;

      const skip = (query.page - 1) * query.limit;
      const [data, total] = await Promise.all([
        this.mktPrisma.client.mktEnquiry.findMany({
          where,
          skip,
          take: query.limit,
          orderBy: { createdAt: 'desc' },
          include: { listing: { select: { id: true, title: true, basePrice: true } } },
        }),
        this.mktPrisma.client.mktEnquiry.count({ where }),
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
      this.logger.error(`ListEnquiriesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
