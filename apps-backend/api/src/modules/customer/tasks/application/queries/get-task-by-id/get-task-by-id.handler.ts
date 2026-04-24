// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskByIdQuery } from './get-task-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CrossDbResolverService } from '../../../../../../core/prisma/cross-db-resolver.service';
import { NotFoundException, Logger } from '@nestjs/common';

@QueryHandler(GetTaskByIdQuery)
export class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery> {
    private readonly logger = new Logger(GetTaskByIdHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: CrossDbResolverService,
  ) {}

  async execute(query: GetTaskByIdQuery) {
    try {
      const task = await this.prisma.working.task.findUnique({
        where: { id: query.taskId },
        include: {
          watchers: true,
          comments: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          reminders: { where: { isActive: true }, orderBy: { scheduledAt: 'asc' } },
          _count: { select: { comments: true, watchers: true, history: true, reminders: true } },
        },
      });

      if (!task || !task.isActive) throw new NotFoundException('Task not found');

      // Resolve cross-DB user references
      const assignedTo = await this.resolver.resolveUser(task.assignedToId);
      const createdBy = await this.resolver.resolveUser(task.createdById);
      const watchers = await this.resolver.resolveUsers(task.watchers, ['userId'], { id: true, firstName: true, lastName: true });
      const comments = await this.resolver.resolveUsers(task.comments, ['authorId'], { id: true, firstName: true, lastName: true });

      return { ...task, assignedTo, createdBy, watchers, comments };
    } catch (error) {
      this.logger.error(`GetTaskByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
