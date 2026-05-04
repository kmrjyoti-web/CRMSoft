import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GetFollowingQuery } from './get-following.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetFollowingQuery)
@Injectable()
export class GetFollowingHandler implements IQueryHandler<GetFollowingQuery> {
    private readonly logger = new Logger(GetFollowingHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetFollowingQuery) {
    try {
      const { userId, page, limit } = query;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.mktPrisma.client.mktFollow.findMany({
          where: { followerId: userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.mktPrisma.client.mktFollow.count({ where: { followerId: userId } }),
      ]);

      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      this.logger.error(`GetFollowingHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
