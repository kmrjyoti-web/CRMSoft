import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Logger } from '@nestjs/common';
import { GetTeamTasksOverviewQuery } from './get-team-tasks-overview.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskAssignmentService } from '../../services/task-assignment.service';

@QueryHandler(GetTeamTasksOverviewQuery)
export class GetTeamTasksOverviewHandler implements IQueryHandler<GetTeamTasksOverviewQuery> {
    private readonly logger = new Logger(GetTeamTasksOverviewHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentService: TaskAssignmentService,
  ) {}

  async execute(query: GetTeamTasksOverviewQuery) {
    try {
      if (query.roleLevel > 3) {
        throw new ForbiddenException('Only managers and above can view team task overview');
      }

      const reporteeIds = await this.assignmentService.getReporteeIds(query.userId);
      const teamUserIds = [query.userId, ...reporteeIds];

      // Get start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);

      // Get user info for all team members
      const users = await this.prisma.user.findMany({
        where: { id: { in: teamUserIds }, isDeleted: false },
        select: { id: true, firstName: true, lastName: true },
      });

      // Build overview for each team member
      const overview = await Promise.all(
        users.map(async (user) => {
          const baseWhere = {
            assignedToId: user.id,
            tenantId: query.tenantId,
            isActive: true,
          };

          const [pending, inProgress, overdue, onHold, completedThisWeek] = await Promise.all([
            this.prisma.working.task.count({ where: { ...baseWhere, status: 'OPEN' } }),
            this.prisma.working.task.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
            this.prisma.working.task.count({
              where: {
                ...baseWhere,
                status: { in: ['OPEN', 'IN_PROGRESS'] },
                dueDate: { lt: now },
              },
            }),
            this.prisma.working.task.count({ where: { ...baseWhere, status: 'ON_HOLD' } }),
            this.prisma.working.task.count({
              where: {
                ...baseWhere,
                status: 'COMPLETED',
                completedAt: { gte: startOfWeek },
              },
            }),
          ]);

          return {
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`.trim(),
            pending,
            inProgress,
            overdue,
            onHold,
            completedThisWeek,
          };
        }),
      );

      return overview;
    } catch (error) {
      this.logger.error(`GetTeamTasksOverviewHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
