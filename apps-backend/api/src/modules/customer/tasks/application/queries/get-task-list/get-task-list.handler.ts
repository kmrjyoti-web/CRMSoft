// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTaskListQuery } from './get-task-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskVisibilityService } from '../../services/task-visibility.service';

@QueryHandler(GetTaskListQuery)
export class GetTaskListHandler implements IQueryHandler<GetTaskListQuery> {
    private readonly logger = new Logger(GetTaskListHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly visibility: TaskVisibilityService,
  ) {}

  async execute(query: GetTaskListQuery) {
    try {
      const where: any = await this.visibility.buildWhereClause({
        userId: query.userId,
        roleLevel: query.roleLevel,
        tenantId: query.tenantId,
      });

      if (query.status) where.status = query.status;
      if (query.priority) where.priority = query.priority;
      if (query.assignedToId) where.assignedToId = query.assignedToId;
      if (query.search) {
        where.OR = [
          ...(where.OR || []),
          { title: { contains: query.search, mode: 'insensitive' } },
          { taskNumber: { contains: query.search, mode: 'insensitive' } },
        ];
        // If there were visibility OR conditions, we need to AND them
        if (where.OR && where.OR.length > 2) {
          const visibilityOr = where.OR.slice(0, -2);
          const searchOr = where.OR.slice(-2);
          delete where.OR;
          where.AND = [{ OR: visibilityOr }, { OR: searchOr }];
        }
      }

      const skip = (query.page - 1) * query.limit;
      const orderBy = { [query.sortBy]: query.sortOrder };

      const [data, total] = await Promise.all([
        this.prisma.working.task.findMany({
          where,
          skip,
          take: query.limit,
          orderBy,
          include: {
            assignedTo: { select: { id: true, firstName: true, lastName: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { comments: true, watchers: true, reminders: true } },
          },
        }),
        this.prisma.working.task.count({ where }),
      ]);

      return { data, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
    } catch (error) {
      this.logger.error(`GetTaskListHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
