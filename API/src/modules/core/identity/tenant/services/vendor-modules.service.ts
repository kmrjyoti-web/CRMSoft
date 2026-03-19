import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class VendorModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: { vendorId?: string; status?: string; page: number; limit: number }) {
    const STATUS_MAP: Record<string, string> = {
      ACTIVE: 'PUBLISHED',
      INACTIVE: 'SUSPENDED',
    };

    const where: any = {};
    if (filters.status) where.status = STATUS_MAP[filters.status] ?? filters.status;
    if (filters.vendorId) where.vendorId = filters.vendorId;

    const [rawData, total] = await Promise.all([
      this.prisma.marketplaceModule.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.marketplaceModule.count({ where }),
    ]);

    const data = rawData.map((m) => ({
      id: m.id,
      code: m.moduleCode,
      name: m.moduleName,
      description: m.shortDescription,
      category: m.category,
      version: m.version,
      status: m.status === 'PUBLISHED' ? 'ACTIVE' : m.status === 'SUSPENDED' ? 'INACTIVE' : m.status,
      features: [],
      pricing: { monthly: 0, yearly: 0 },
      subscriberCount: m.installCount,
      dependsOn: [],
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    return { data, total };
  }

  async getById(id: string) {
    const m = await this.prisma.marketplaceModule.findUnique({ where: { id } });
    if (!m) return null;
    return {
      id: m.id,
      code: m.moduleCode,
      name: m.moduleName,
      description: m.shortDescription,
      category: m.category,
      version: m.version,
      status: m.status === 'PUBLISHED' ? 'ACTIVE' : m.status === 'SUSPENDED' ? 'INACTIVE' : m.status,
      features: [],
      pricing: { monthly: 0, yearly: 0 },
      subscriberCount: m.installCount,
      dependsOn: [],
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  async create(data: {
    moduleCode: string;
    moduleName: string;
    category: string;
    shortDescription: string;
    longDescription: string;
    version: string;
    vendorId: string;
  }) {
    return this.prisma.marketplaceModule.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.prisma.marketplaceModule.update({ where: { id }, data: data as any });
  }

  async deactivate(id: string) {
    return this.prisma.marketplaceModule.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }
}
