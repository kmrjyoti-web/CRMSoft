import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GetAnalyticsQuery } from './get-analytics.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetAnalyticsQuery)
@Injectable()
export class GetAnalyticsHandler implements IQueryHandler<GetAnalyticsQuery> {
    private readonly logger = new Logger(GetAnalyticsHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetAnalyticsQuery) {
    try {
      // Return pre-computed summary if available
      const summary = await this.mktPrisma.client.mktAnalyticsSummary.findFirst({
        where: {
          tenantId: query.tenantId,
          entityType: query.entityType as any,
          entityId: query.entityId,
        },
      });

      // Also return recent raw event counts (last 24h)
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentEvents = await this.mktPrisma.client.mktAnalyticsEvent.groupBy({
        by: ['eventType'],
        where: {
          tenantId: query.tenantId,
          entityType: query.entityType as any,
          entityId: query.entityId,
          timestamp: { gte: since },
        },
        _count: { eventType: true },
      });

      const recentBreakdown = recentEvents.reduce((acc: Record<string, number>, row: any) => {
        acc[row.eventType] = row._count.eventType;
        return acc;
      }, {});

      return {
        summary,
        recentBreakdown,
        last24h: recentBreakdown,
      };
    } catch (error) {
      this.logger.error(`GetAnalyticsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
