// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListVersionsQuery } from '../queries/list-versions.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(ListVersionsQuery)
export class ListVersionsHandler implements IQueryHandler<ListVersionsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListVersionsQuery) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.releaseType) where.releaseType = query.releaseType;

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.platform.appVersion.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { patches: { select: { id: true, industryCode: true, status: true } } },
      }),
      this.prisma.platform.appVersion.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
