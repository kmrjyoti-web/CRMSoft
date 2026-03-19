// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskByIdQuery } from './get-task-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetTaskByIdQuery)
export class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTaskByIdQuery) {
    const task = await this.prisma.working.task.findUnique({
      where: { id: query.taskId },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        watchers: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        comments: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
        },
        reminders: { where: { isActive: true }, orderBy: { scheduledAt: 'asc' } },
        _count: { select: { comments: true, watchers: true, history: true, reminders: true } },
      },
    });

    if (!task || !task.isActive) throw new NotFoundException('Task not found');
    return task;
  }
}
