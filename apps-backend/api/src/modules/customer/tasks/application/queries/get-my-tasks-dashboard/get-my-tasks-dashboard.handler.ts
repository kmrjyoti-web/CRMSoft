// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetMyTasksDashboardQuery } from './get-my-tasks-dashboard.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetMyTasksDashboardQuery)
export class GetMyTasksDashboardHandler implements IQueryHandler<GetMyTasksDashboardQuery> {
    private readonly logger = new Logger(GetMyTasksDashboardHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyTasksDashboardQuery) {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const baseWhere = {
        assignedToId: query.userId,
        tenantId: query.tenantId,
        isActive: true,
      };

      const [overdue, dueToday, upcoming, recentlyCompleted] = await Promise.all([
        // Overdue: open/in-progress tasks past their due date
        this.prisma.working.task.findMany({
          where: {
            ...baseWhere,
            status: { in: ['OPEN', 'IN_PROGRESS'] },
            dueDate: { lt: now },
          },
          orderBy: { dueDate: 'asc' },
          include: {
            createdBy: { select: { id: true, firstName: true, lastName: true } },
          },
        }),

        // Due today: tasks due within today that are not completed/cancelled
        this.prisma.working.task.findMany({
          where: {
            ...baseWhere,
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
            dueDate: { gte: startOfDay, lte: endOfDay },
          },
          orderBy: { dueDate: 'asc' },
          include: {
            createdBy: { select: { id: true, firstName: true, lastName: true } },
          },
        }),

        // Upcoming: tasks due after today, not completed/cancelled, limit 10
        this.prisma.working.task.findMany({
          where: {
            ...baseWhere,
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
            dueDate: { gt: endOfDay },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
          include: {
            createdBy: { select: { id: true, firstName: true, lastName: true } },
          },
        }),

        // Recently completed: last 10 completed tasks
        this.prisma.working.task.findMany({
          where: {
            ...baseWhere,
            status: 'COMPLETED',
          },
          orderBy: { completedAt: 'desc' },
          take: 10,
          include: {
            createdBy: { select: { id: true, firstName: true, lastName: true } },
          },
        }),
      ]);

      return {
        overdue,
        dueToday,
        upcoming,
        recentlyCompleted,
        counts: {
          overdue: overdue.length,
          dueToday: dueToday.length,
          upcoming: upcoming.length,
          completed: recentlyCompleted.length,
        },
      };
    } catch (error) {
      this.logger.error(`GetMyTasksDashboardHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
