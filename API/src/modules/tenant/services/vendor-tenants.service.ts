import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class VendorTenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: { status?: string; page: number; limit: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: { subscriptions: true, profile: true },
    });
  }

  async listForDbAdmin(page: number, limit: number) {
    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, slug: true, status: true, createdAt: true },
      }),
      this.prisma.tenant.count(),
    ]);
    return { tenants, total };
  }

  async suspend(id: string) {
    return this.prisma.tenant.update({ where: { id }, data: { status: 'SUSPENDED' } });
  }

  async activate(id: string) {
    return this.prisma.tenant.update({ where: { id }, data: { status: 'ACTIVE' } });
  }
}
