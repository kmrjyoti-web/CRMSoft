import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetOptOutsQuery } from './query';

@QueryHandler(GetOptOutsQuery)
export class GetOptOutsHandler implements IQueryHandler<GetOptOutsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOptOutsQuery) {
    const where = { wabaId: query.wabaId };

    const [data, total] = await Promise.all([
      this.prisma.working.waOptOut.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { optedOutAt: 'desc' },
      }),
      this.prisma.working.waOptOut.count({ where }),
    ]);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
