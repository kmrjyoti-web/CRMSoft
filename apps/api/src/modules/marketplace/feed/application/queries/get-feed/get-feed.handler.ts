import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GetFeedQuery } from './get-feed.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetFeedQuery)
@Injectable()
export class GetFeedHandler implements IQueryHandler<GetFeedQuery> {
    private readonly logger = new Logger(GetFeedHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetFeedQuery) {
    try {
      const where: Record<string, any> = {
        tenantId: query.tenantId,
        isDeleted: false,
        status: 'ACTIVE',
      };

      if (query.postType) where.postType = query.postType;
      if (query.authorId) where.authorId = query.authorId;

      const skip = (query.page - 1) * query.limit;

      const [data, total] = await Promise.all([
        this.mktPrisma.client.mktPost.findMany({
          where,
          skip,
          take: query.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { engagements: true, comments: true } },
          },
        }),
        this.mktPrisma.client.mktPost.count({ where }),
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
      this.logger.error(`GetFeedHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
