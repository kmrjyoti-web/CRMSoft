import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class VendorTenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: { status?: string; page: number; limit: number; parentTenantId?: string }) {
    const where: any = {};
    if (filters.status)       where.status         = filters.status;
    if (filters.parentTenantId) where.parentTenantId = filters.parentTenantId;

    const [tenants, total] = await Promise.all([
      this.prisma.identity.tenant.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { childTenants: true } } },
      }),
      this.prisma.identity.tenant.count({ where }),
    ]);

    const data = tenants.map(({ _count, ...t }) => ({ ...t, childTenantCount: _count.childTenants }));
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.identity.tenant.findUnique({
      where: { id },
      include: { subscriptions: true, profile: true },
    });
  }

  async listForDbAdmin(page: number, limit: number) {
    const [tenants, total] = await Promise.all([
      this.prisma.identity.tenant.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, slug: true, status: true, createdAt: true },
      }),
      this.prisma.identity.tenant.count(),
    ]);
    return { tenants, total };
  }

  async suspend(id: string) {
    return this.prisma.identity.tenant.update({ where: { id }, data: { status: 'SUSPENDED' } });
  }

  async activate(id: string) {
    return this.prisma.identity.tenant.update({ where: { id }, data: { status: 'ACTIVE' } });
  }
}
