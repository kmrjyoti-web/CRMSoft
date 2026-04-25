import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GetFollowersQuery } from './get-followers.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetFollowersQuery)
@Injectable()
export class GetFollowersHandler implements IQueryHandler<GetFollowersQuery> {
    private readonly logger = new Logger(GetFollowersHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetFollowersQuery) {
    try {
      const { userId, page, limit } = query;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.mktPrisma.client.mktFollow.findMany({
          where: { followingId: userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.mktPrisma.client.mktFollow.count({ where: { followingId: userId } }),
      ]);

      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      this.logger.error(`GetFollowersHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
