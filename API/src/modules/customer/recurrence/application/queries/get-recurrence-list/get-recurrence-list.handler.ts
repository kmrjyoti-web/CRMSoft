import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetRecurrenceListQuery } from './get-recurrence-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetRecurrenceListQuery)
export class GetRecurrenceListHandler implements IQueryHandler<GetRecurrenceListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRecurrenceListQuery) {
    const where: any = {};
    if (query.createdById) where.createdById = query.createdById;
    if (query.pattern) where.pattern = query.pattern;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await Promise.all([
      this.prisma.recurringEvent.findMany({
        where,
        orderBy: { nextOccurrence: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.recurringEvent.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
