import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class VendorPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.prisma.plan.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.plan.count(),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  async create(data: Record<string, unknown>) {
    return this.prisma.plan.create({ data: data as any });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.prisma.plan.update({ where: { id }, data: data as any });
  }

  async deactivate(id: string) {
    return this.prisma.plan.update({ where: { id }, data: { isActive: false } });
  }
}
