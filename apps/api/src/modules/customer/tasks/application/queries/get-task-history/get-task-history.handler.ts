// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTaskHistoryQuery } from './get-task-history.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTaskHistoryQuery)
export class GetTaskHistoryHandler implements IQueryHandler<GetTaskHistoryQuery> {
    private readonly logger = new Logger(GetTaskHistoryHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTaskHistoryQuery) {
    try {
      const skip = (query.page - 1) * query.limit;

      const [data, total] = await Promise.all([
        this.prisma.working.taskHistory.findMany({
          where: { taskId: query.taskId },
          skip,
          take: query.limit,
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, firstName: true, lastName: true } } },
        }),
        this.prisma.working.taskHistory.count({ where: { taskId: query.taskId } }),
      ]);

      return { data, total, page: query.page, limit: query.limit };
    } catch (error) {
      this.logger.error(`GetTaskHistoryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
