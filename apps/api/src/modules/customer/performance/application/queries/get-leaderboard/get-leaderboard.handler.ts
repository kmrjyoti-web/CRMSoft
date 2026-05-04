// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetLeaderboardQuery } from './get-leaderboard.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardHandler implements IQueryHandler<GetLeaderboardQuery> {
    private readonly logger = new Logger(GetLeaderboardHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLeaderboardQuery) {
    try {
      const targets = await this.prisma.working.salesTarget.findMany({
        where: { isDeleted: false, isActive: true, period: (query.period as any) ?? 'MONTHLY' },
        orderBy: { achievedPercent: 'desc' },
        take: query.limit ?? 20,
      });

      return targets.map((t, i) => ({
        rank: i + 1,
        userId: t.userId,
        roleId: t.roleId,
        name: t.name,
        metric: t.metric,
        targetValue: Number(t.targetValue),
        currentValue: Number(t.currentValue),
        achievedPercent: Number(t.achievedPercent),
        period: t.period,
        periodStart: t.periodStart,
        periodEnd: t.periodEnd,
      }));
    } catch (error) {
      this.logger.error(`GetLeaderboardHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
