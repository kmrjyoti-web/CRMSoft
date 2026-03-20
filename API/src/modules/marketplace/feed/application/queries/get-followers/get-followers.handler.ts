import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetFollowersQuery } from './get-followers.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetFollowersQuery)
@Injectable()
export class GetFollowersHandler implements IQueryHandler<GetFollowersQuery> {
  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetFollowersQuery) {
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
  }
}
