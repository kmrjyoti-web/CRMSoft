// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class TenantActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log a tenant activity event.
   */
  async log(data: {
    tenantId: string;
    action: string;
    category: string;
    details?: string;
    metadata?: any;
    performedById?: string;
    ipAddress?: string;
  }) {
    return this.prisma.platform.tenantActivityLog.create({
      data: {
        tenantId: data.tenantId,
        action: data.action,
        category: data.category,
        details: data.details ?? null,
        metadata: data.metadata ?? null,
        performedById: data.performedById ?? null,
        ipAddress: data.ipAddress ?? null,
      },
    });
  }

  /**
   * Get paginated activity logs for a specific tenant with optional filters.
   */
  async getByTenant(
    tenantId: string,
    query: {
      category?: string;
      page?: number;
      limit?: number;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.category) {
      where.category = query.category;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = query.dateFrom;
      }
      if (query.dateTo) {
        where.createdAt.lte = query.dateTo;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.platform.tenantActivityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.platform.tenantActivityLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get the most recent activity logs across all tenants.
   */
  async getRecent(limit: number = 20) {
    return this.prisma.platform.tenantActivityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }
}
