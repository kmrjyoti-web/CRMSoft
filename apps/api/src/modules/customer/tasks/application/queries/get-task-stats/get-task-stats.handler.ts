import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTaskStatsQuery } from './get-task-stats.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskVisibilityService } from '../../services/task-visibility.service';

@QueryHandler(GetTaskStatsQuery)
export class GetTaskStatsHandler implements IQueryHandler<GetTaskStatsQuery> {
    private readonly logger = new Logger(GetTaskStatsHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly visibility: TaskVisibilityService,
  ) {}

  async execute(query: GetTaskStatsQuery) {
    try {
      const where = await this.visibility.buildWhereClause({
        userId: query.userId,
        roleLevel: query.roleLevel,
        tenantId: query.tenantId,
      });

      const [total, open, inProgress, completed, overdue, cancelled, onHold] = await Promise.all([
        this.prisma.working.task.count({ where }),
        this.prisma.working.task.count({ where: { ...where, status: 'OPEN' } }),
        this.prisma.working.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        this.prisma.working.task.count({ where: { ...where, status: 'COMPLETED' } }),
        this.prisma.working.task.count({ where: { ...where, status: 'OVERDUE' } }),
        this.prisma.working.task.count({ where: { ...where, status: 'CANCELLED' } }),
        this.prisma.working.task.count({ where: { ...where, status: 'ON_HOLD' } }),
      ]);

      return { total, open, inProgress, completed, overdue, cancelled, onHold };
    } catch (error) {
      this.logger.error(`GetTaskStatsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
