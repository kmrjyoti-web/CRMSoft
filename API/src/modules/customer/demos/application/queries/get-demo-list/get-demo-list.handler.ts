// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDemoListQuery } from './get-demo-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetDemoListQuery)
export class GetDemoListHandler implements IQueryHandler<GetDemoListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDemoListQuery) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.mode) where.mode = query.mode;
    if (query.conductedById) where.conductedById = query.conductedById;
    if (query.search) {
      where.OR = [
        { notes: { contains: query.search, mode: 'insensitive' } },
        { lead: { leadNumber: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.fromDate || query.toDate) {
      where.scheduledAt = {};
      if (query.fromDate) where.scheduledAt.gte = new Date(query.fromDate);
      if (query.toDate) where.scheduledAt.lte = new Date(query.toDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.demo.findMany({
        where,
        include: {
          lead: { select: { id: true, leadNumber: true } },
          conductedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.demo.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
