import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class ApiAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsageSummary(tenantId: string, from?: string, to?: string) {
    const where: any = { tenantId };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [total, byStatus, byPath, byKey] = await Promise.all([
      this.prisma.working.apiRequestLog.aggregate({
        where,
        _count: true,
        _avg: { responseTimeMs: true },
      }),
      this.prisma.working.apiRequestLog.groupBy({
        by: ['statusCode'],
        where,
        _count: true,
      }),
      this.prisma.working.apiRequestLog.groupBy({
        by: ['path', 'method'],
        where,
        _count: true,
        _avg: { responseTimeMs: true },
        orderBy: { _count: { path: 'desc' } },
        take: 20,
      }),
      this.prisma.working.apiRequestLog.groupBy({
        by: ['apiKeyId', 'apiKeyName'],
        where,
        _count: true,
      }),
    ]);

    const statusBreakdown = byStatus.reduce((acc, s) => {
      if (s.statusCode >= 200 && s.statusCode < 300) acc.success += s._count;
      else if (s.statusCode >= 400 && s.statusCode < 500) acc.clientErrors += s._count;
      else if (s.statusCode >= 500) acc.serverErrors += s._count;
      if (s.statusCode === 429) acc.rateLimited += s._count;
      return acc;
    }, { success: 0, clientErrors: 0, serverErrors: 0, rateLimited: 0 });

    return {
      overview: {
        totalRequests: total._count,
        ...statusBreakdown,
        avgResponseTimeMs: Math.round(total._avg.responseTimeMs || 0),
        uniqueApiKeys: byKey.length,
      },
      byStatusCode: byStatus.map(s => ({ statusCode: s.statusCode, count: s._count })),
      byEndpoint: byPath.map(p => ({
        path: p.path,
        method: p.method,
        count: p._count,
        avgMs: Math.round(p._avg.responseTimeMs || 0),
      })),
      byApiKey: byKey.map(k => ({
        keyId: k.apiKeyId,
        keyName: k.apiKeyName,
        requests: k._count,
      })),
    };
  }

  async getWebhookStats(tenantId: string) {
    const [total, byStatus, byEvent] = await Promise.all([
      this.prisma.working.webhookDelivery.aggregate({
        where: { tenantId },
        _count: true,
        _avg: { responseTimeMs: true },
      }),
      this.prisma.working.webhookDelivery.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.working.webhookDelivery.groupBy({
        by: ['eventType'],
        where: { tenantId },
        _count: true,
        orderBy: { _count: { eventType: 'desc' } },
      }),
    ]);

    const delivered = byStatus.find(s => s.status === 'WH_DELIVERED')?._count || 0;
    const failed = byStatus.find(s => s.status === 'WH_DELIVERY_FAILED')?._count || 0;

    return {
      totalDeliveries: total._count,
      totalDelivered: delivered,
      totalFailed: failed,
      successRate: total._count > 0 ? Math.round((delivered / total._count) * 100) : 0,
      avgResponseTimeMs: Math.round(total._avg.responseTimeMs || 0),
      byEvent: byEvent.map(e => ({ eventType: e.eventType, count: e._count })),
    };
  }
}
