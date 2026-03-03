import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetEntityEmailsQuery } from './query';

@QueryHandler(GetEntityEmailsQuery)
export class GetEntityEmailsHandler implements IQueryHandler<GetEntityEmailsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEntityEmailsQuery) {
    const where = {
      linkedEntityType: query.entityType,
      linkedEntityId: query.entityId,
    };

    const [data, total] = await Promise.all([
      this.prisma.email.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          account: { select: { id: true, emailAddress: true } },
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
