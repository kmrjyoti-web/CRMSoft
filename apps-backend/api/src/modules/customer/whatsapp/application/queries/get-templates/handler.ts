import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetTemplatesQuery } from './query';

@QueryHandler(GetTemplatesQuery)
export class GetTemplatesHandler implements IQueryHandler<GetTemplatesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTemplatesQuery) {
    const where: any = { wabaId: query.wabaId };

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

    const [data, total] = await Promise.all([
      this.prisma.working.waTemplate.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.working.waTemplate.count({ where }),
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
