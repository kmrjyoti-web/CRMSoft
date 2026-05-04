// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTeamPerformanceQuery } from './get-team-performance.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTeamPerformanceQuery)
export class GetTeamPerformanceHandler implements IQueryHandler<GetTeamPerformanceQuery> {
    private readonly logger = new Logger(GetTeamPerformanceHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTeamPerformanceQuery) {
    try {
      const period = query.period ?? 'MONTHLY';
      const targets = await this.prisma.working.salesTarget.findMany({
        where: { isDeleted: false, isActive: true, period: period as any },
      });

      const byUser: Record<string, any> = {};
      for (const t of targets) {
        if (!t.userId) continue;
        if (!byUser[t.userId]) {
          byUser[t.userId] = { userId: t.userId, targets: [], totalAchieved: 0, totalTarget: 0 };
        }
        byUser[t.userId].targets.push(t);
        byUser[t.userId].totalTarget += Number(t.targetValue);
        byUser[t.userId].totalAchieved += Number(t.currentValue);
      }

      return {
        period,
        totalTargets: targets.length,
        members: Object.values(byUser).map((u: Record<string, unknown>) => ({
          userId: u.userId,
          targetCount: u.targets.length,
          totalTarget: u.totalTarget,
          totalAchieved: u.totalAchieved,
          avgAchievement: u.totalTarget > 0 ? Math.round((u.totalAchieved / u.totalTarget) * 100) : 0,
        })),
      };
    } catch (error) {
      this.logger.error(`GetTeamPerformanceHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
