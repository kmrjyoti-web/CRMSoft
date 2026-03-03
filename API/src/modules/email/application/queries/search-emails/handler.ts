import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { SearchEmailsQuery } from './query';

@QueryHandler(SearchEmailsQuery)
export class SearchEmailsHandler implements IQueryHandler<SearchEmailsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: SearchEmailsQuery) {
    const where: any = {
      OR: [
        { subject: { contains: query.query, mode: 'insensitive' } },
        { bodyText: { contains: query.query, mode: 'insensitive' } },
        { fromEmail: { contains: query.query, mode: 'insensitive' } },
      ],
    };

    if (query.accountId) where.accountId = query.accountId;

    const [data, total] = await Promise.all([
      this.prisma.email.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: { select: { id: true, emailAddress: true } },
          thread: { select: { id: true, subject: true } },
        },
      }),
      this.prisma.email.count({ where }),
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
