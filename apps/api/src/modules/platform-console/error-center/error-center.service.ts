import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

@Injectable()
export class ErrorCenterService {
  private readonly logger = new Logger(ErrorCenterService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async listErrors(params: {
    page?: number;
    limit?: number;
    severity?: string;
    brandId?: string;
    verticalType?: string;
    resolved?: boolean;
    tenantId?: string;
    partnerCode?: string;
  }) {
    try {
      const page = params.page ?? 1;
      const limit = Math.min(params.limit ?? 20, 100);
      const skip = (page - 1) * limit;

      const where: any = {};
      if (params.severity) where.severity = params.severity;
      if (params.brandId) where.brandId = params.brandId;
      if (params.verticalType) where.verticalType = params.verticalType;
      if (params.tenantId) where.tenantId = params.tenantId;
      if (params.partnerCode) where.brandId = params.partnerCode;
      if (params.resolved !== undefined) {
        where.resolvedAt = params.resolved ? { not: null } : null;
      }

      const [items, total] = await Promise.all([
        this.db.globalErrorLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            severity: true,
            errorCode: true,
            message: true,
            module: true,
            endpoint: true,
            httpStatus: true,
            brandId: true,
            verticalType: true,
            resolvedAt: true,
            createdAt: true,
          },
        }),
        this.db.globalErrorLog.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(
        `ErrorCenterService.listErrors failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getError(id: string) {
    try {
      const error = await this.db.globalErrorLog.findUnique({
        where: { id },
        include: { escalation: true },
      });
      if (!error) throw new NotFoundException(`Error log ${id} not found`);
      return error;
    } catch (error) {
      this.logger.error(
        `ErrorCenterService.getError failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getStats() {
    try {
      const [bySeverity, byBrand, byVertical, resolvedRate] =
        await Promise.all([
          this.db.globalErrorLog.groupBy({
            by: ['severity'],
            _count: { id: true },
          }),
          this.db.globalErrorLog.groupBy({
            by: ['brandId'],
            _count: { id: true },
            where: { brandId: { not: null } },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
          }),
          this.db.globalErrorLog.groupBy({
            by: ['verticalType'],
            _count: { id: true },
            where: { verticalType: { not: null } },
          }),
          this.db.globalErrorLog.count({ where: { resolvedAt: { not: null } } }),
        ]);

      const total = await this.db.globalErrorLog.count();

      return {
        total,
        resolvedRate: total > 0 ? Math.round((resolvedRate / total) * 100) : 0,
        bySeverity,
        byBrand,
        byVertical,
      };
    } catch (error) {
      this.logger.error(
        `ErrorCenterService.getStats failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getTenantErrors(tenantId: string, limit = 50): Promise<{
    tenantId: string;
    errorCount: number;
    last50: object[];
    trend7d: { date: string; count: number }[];
  }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [last50, allRecent] = await Promise.all([
      this.db.globalErrorLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true, severity: true, errorCode: true, message: true,
          module: true, httpStatus: true, resolvedAt: true, createdAt: true,
        },
      }),
      this.db.globalErrorLog.findMany({
        where: { tenantId, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    // Build 7-day trend buckets
    const buckets: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    for (const row of allRecent) {
      const day = row.createdAt.toISOString().slice(0, 10);
      if (day in buckets) buckets[day]++;
    }

    return {
      tenantId,
      errorCount: allRecent.length,
      last50,
      trend7d: Object.entries(buckets).map(([date, count]) => ({ date, count })),
    };
  }

  async getTenantHealthSummary(tenantId: string): Promise<{
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    errorCount24h: number;
    lastErrorAt: Date | null;
    criticalCount24h: number;
  }> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [errors, lastError] = await Promise.all([
      this.db.globalErrorLog.findMany({
        where: { tenantId, createdAt: { gte: since } },
        select: { severity: true, createdAt: true },
      }),
      this.db.globalErrorLog.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const criticalCount = errors.filter((e) => e.severity === 'CRITICAL').length;
    const totalCount = errors.length;
    const status =
      criticalCount >= 3 ? 'DOWN' :
      criticalCount >= 1 || totalCount >= 10 ? 'DEGRADED' :
      'HEALTHY';

    return {
      status,
      errorCount24h: totalCount,
      lastErrorAt: lastError?.createdAt ?? null,
      criticalCount24h: criticalCount,
    };
  }

  async getTrends(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY') {
    try {
      const trends = await this.db.errorTrend.findMany({
        where: { period },
        orderBy: { periodDate: 'desc' },
        take: 30,
      });
      return trends;
    } catch (error) {
      this.logger.error(
        `ErrorCenterService.getTrends failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
