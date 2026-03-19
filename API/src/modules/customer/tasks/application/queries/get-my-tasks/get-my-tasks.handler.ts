// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyTasksQuery } from './get-my-tasks.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetMyTasksQuery)
export class GetMyTasksHandler implements IQueryHandler<GetMyTasksQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyTasksQuery) {
    const where: any = { assignedToId: query.userId, isActive: true };
    if (query.status) where.status = query.status;

    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { comments: true, watchers: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
  }
}
