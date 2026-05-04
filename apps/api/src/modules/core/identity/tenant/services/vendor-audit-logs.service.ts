import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class VendorAuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: {
    tenantId?: string;
    category?: string;
    action?: string;
    page: number;
    limit: number;
  }) {
    const where: any = {};
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.category) where.category = filters.category;
    if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.platform.tenantActivityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.platform.tenantActivityLog.count({ where }),
    ]);

    return { data, total };
  }
}
