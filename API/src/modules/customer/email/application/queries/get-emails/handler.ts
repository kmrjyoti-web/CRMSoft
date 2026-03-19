import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetEmailsQuery } from './query';

@QueryHandler(GetEmailsQuery)
export class GetEmailsHandler implements IQueryHandler<GetEmailsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEmailsQuery) {
    const where: any = {};

    if (query.accountId) where.accountId = query.accountId;
    if (query.direction) where.direction = query.direction;
    if (query.status) where.status = query.status;
    if (query.isStarred !== undefined) where.isStarred = query.isStarred;
    if (query.isRead !== undefined) where.isRead = query.isRead;

    const [data, total] = await Promise.all([
      this.prisma.email.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: { select: { id: true, emailAddress: true, provider: true } },
          thread: { select: { id: true, subject: true } },
          attachments: { select: { id: true, fileName: true, fileSize: true } },
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
