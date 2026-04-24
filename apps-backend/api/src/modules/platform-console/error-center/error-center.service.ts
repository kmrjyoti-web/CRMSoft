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
  }) {
    try {
      const page = params.page ?? 1;
      const limit = Math.min(params.limit ?? 20, 100);
      const skip = (page - 1) * limit;

      const where: any = {};
      if (params.severity) where.severity = params.severity;
      if (params.brandId) where.brandId = params.brandId;
      if (params.verticalType) where.verticalType = params.verticalType;
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
