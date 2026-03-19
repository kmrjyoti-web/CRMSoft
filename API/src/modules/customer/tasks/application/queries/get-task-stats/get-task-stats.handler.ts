import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskStatsQuery } from './get-task-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskVisibilityService } from '../../services/task-visibility.service';

@QueryHandler(GetTaskStatsQuery)
export class GetTaskStatsHandler implements IQueryHandler<GetTaskStatsQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visibility: TaskVisibilityService,
  ) {}

  async execute(query: GetTaskStatsQuery) {
    const where = await this.visibility.buildWhereClause({
      userId: query.userId,
      roleLevel: query.roleLevel,
      tenantId: query.tenantId,
    });

    const [total, open, inProgress, completed, overdue, cancelled, onHold] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { ...where, status: 'OVERDUE' } }),
      this.prisma.task.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.task.count({ where: { ...where, status: 'ON_HOLD' } }),
    ]);

    return { total, open, inProgress, completed, overdue, cancelled, onHold };
  }
}
