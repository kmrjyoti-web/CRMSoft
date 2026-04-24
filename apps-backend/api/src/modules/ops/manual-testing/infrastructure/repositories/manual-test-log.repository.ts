import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export const MANUAL_TEST_LOG_REPOSITORY = Symbol('MANUAL_TEST_LOG_REPOSITORY');

export interface IManualTestLogRepository {
  create(data: CreateManualTestLogData): Promise<Record<string, unknown>>;
  findById(id: string): Promise<any | null>;
  findByTenantId(tenantId: string, filters: ListFilters): Promise<any[]>;
  update(id: string, data: Partial<CreateManualTestLogData>): Promise<Record<string, unknown>>;
  getSummary(tenantId: string, filters: SummaryFilters): Promise<Record<string, unknown>>;
}

export interface CreateManualTestLogData {
  tenantId: string;
  userId: string;
  testRunId?: string;
  testGroupId?: string;
  module: string;
  pageName: string;
  action: string;
  expectedResult: string;
  actualResult: string;
  status: string;
  severity?: string;
  screenshotUrls?: string[];
  videoUrl?: string;
  notes?: string;
  browser?: string;
  os?: string;
  screenResolution?: string;
  bugReported?: boolean;
  bugId?: string;
}

export interface ListFilters {
  testRunId?: string;
  module?: string;
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface SummaryFilters {
  testRunId?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class PrismaManualTestLogRepository implements IManualTestLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateManualTestLogData) {
    return this.prisma.platform.manualTestLog.create({ data: data as any });
  }

  async findById(id: string) {
    return this.prisma.platform.manualTestLog.findUnique({ where: { id } });
  }

  async findByTenantId(tenantId: string, filters: ListFilters = {}) {
    const { testRunId, module, status, userId, page = 1, limit = 50 } = filters;
    return this.prisma.platform.manualTestLog.findMany({
      where: {
        tenantId,
        ...(testRunId ? { testRunId } : {}),
        ...(module ? { module } : {}),
        ...(status ? { status } : {}),
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async update(id: string, data: Partial<CreateManualTestLogData>) {
    return this.prisma.platform.manualTestLog.update({ where: { id }, data: data as any });
  }

  async getSummary(tenantId: string, filters: SummaryFilters = {}) {
    const { testRunId, from, to } = filters;

    const where: any = {
      tenantId,
      ...(testRunId ? { testRunId } : {}),
      ...(from || to ? {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      } : {}),
    };

    const [total, byStatus, byModule] = await Promise.all([
      this.prisma.platform.manualTestLog.count({ where }),
      this.prisma.platform.manualTestLog.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.platform.manualTestLog.groupBy({
        by: ['module', 'status'],
        where,
        _count: { id: true },
      }),
    ]);

    // Build module summary
    const moduleMap: Record<string, Record<string, number>> = {};
    for (const row of byModule) {
      if (!moduleMap[row.module]) moduleMap[row.module] = {};
      moduleMap[row.module][row.status] = (row as any)._count.id;
    }

    return {
      total,
      byStatus: byStatus.reduce((acc, row) => {
        acc[row.status] = (row as any)._count.status;
        return acc;
      }, {} as Record<string, number>),
      byModule: Object.entries(moduleMap).map(([mod, counts]) => ({
        module: mod,
        ...counts,
        total: Object.values(counts).reduce((s, n) => s + n, 0),
      })),
    };
  }
}
