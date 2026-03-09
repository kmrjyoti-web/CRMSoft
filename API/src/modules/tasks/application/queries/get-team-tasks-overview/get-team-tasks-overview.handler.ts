import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { GetTeamTasksOverviewQuery } from './get-team-tasks-overview.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TaskAssignmentService } from '../../services/task-assignment.service';

@QueryHandler(GetTeamTasksOverviewQuery)
export class GetTeamTasksOverviewHandler implements IQueryHandler<GetTeamTasksOverviewQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentService: TaskAssignmentService,
  ) {}

  async execute(query: GetTeamTasksOverviewQuery) {
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
          this.prisma.task.count({ where: { ...baseWhere, status: 'OPEN' } }),
          this.prisma.task.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
          this.prisma.task.count({
            where: {
              ...baseWhere,
              status: { in: ['OPEN', 'IN_PROGRESS'] },
              dueDate: { lt: now },
            },
          }),
          this.prisma.task.count({ where: { ...baseWhere, status: 'ON_HOLD' } }),
          this.prisma.task.count({
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
  }
}
