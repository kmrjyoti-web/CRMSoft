import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskHistoryQuery } from './get-task-history.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetTaskHistoryQuery)
export class GetTaskHistoryHandler implements IQueryHandler<GetTaskHistoryQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTaskHistoryQuery) {
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await Promise.all([
      this.prisma.taskHistory.findMany({
        where: { taskId: query.taskId },
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { changedBy: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.taskHistory.count({ where: { taskId: query.taskId } }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
